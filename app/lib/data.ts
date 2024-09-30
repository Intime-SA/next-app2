import { sql } from "@vercel/postgres";
import {
  ChartData,
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Order,
  Revenue,
  TrakeoData,
} from "./definitions";
import { formatCurrency } from "./utils";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { db, secondDb } from "./firebaseConfig";
import { format, toZonedTime } from "date-fns-tz";
import { addHours } from "date-fns";

export async function fetchRevenue() {
  try {
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    console.log("Data fetch completed after 3 seconds.");

    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

// Asegúrate de que este es el archivo donde está la configuración de Firebase

// Función para obtener los datos de la tabla "trakeoKaury"
interface PaginatedResult {
  data: TrakeoData[]; // Los datos obtenidos
  lastVisible: any; // El último documento visible para futuras consultas
}
export const fetchOrdersData = async (): Promise<{
  orders: Order[];
  chartData: ChartData[];
}> => {
  const querySnapshot = await getDocs(collection(db, "userOrders"));

  // Mapeo de los datos de la colección
  const ordersData: Order[] = querySnapshot.docs.map(
    (doc: QueryDocumentSnapshot) => ({
      ...doc.data(),
      id: doc.id,
    })
  ) as Order[];

  // Lógica de agrupación y filtrado por fecha
  const groupedData = ordersData.reduce(
    (
      acc: Record<
        string,
        { count: number; ipSet: Set<string>; totalSales: number }
      >,
      order
    ) => {
      const utcDate = order.date.toDate();
      const argDate = toZonedTime(utcDate, "America/Argentina/Buenos_Aires");

      // Formateo de la fecha para agrupar por día
      const formattedDate = format(argDate, "yyyy-MM-dd", {
        timeZone: "America/Argentina/Buenos_Aires",
      });

      // Si no existe aún el registro para esa fecha, lo inicializamos
      if (!acc[formattedDate]) {
        acc[formattedDate] = { count: 0, ipSet: new Set(), totalSales: 0 };
      }

      // Actualización de los valores para la fecha agrupada
      acc[formattedDate].count += 1;
      acc[formattedDate].ipSet.add(order.ipAddress);
      acc[formattedDate].totalSales += order.total;

      return acc;
    },
    {}
  );

  // Obtención de la fecha de hace 30 días
  const today = toZonedTime(new Date(), "America/Argentina/Buenos_Aires");
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30);

  // Conversión del objeto agrupado a un array y filtrado de los últimos 30 días
  const chartData: ChartData[] = Object.keys(groupedData)
    .filter((date) => new Date(date) >= lastMonth)
    .map((date) => ({
      date,
      orders: groupedData[date].count,
      uniqueIPs: groupedData[date].ipSet.size,
      totalSales: groupedData[date].totalSales,
      label: `Órdenes del día ${date}`,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { orders: ordersData, chartData };
};

// Función para obtener datos con paginación
export const fetchTrakeoData = async (
  lastDoc: any = null
): Promise<PaginatedResult> => {
  try {
    // Referencia a la colección "trakeoKaury"
    const trakeoCollectionRef = collection(secondDb, "trakeoKaury");

    // Construir la consulta, limitando a 10 documentos y ordenando por fecha
    let q = query(trakeoCollectionRef, orderBy("dateTime", "desc"), limit(10));

    // Si ya tenemos un último documento visible, lo usamos para la paginación
    if (lastDoc) {
      q = query(
        trakeoCollectionRef,
        orderBy("dateTime", "desc"),
        startAfter(lastDoc),
        limit(10)
      );
    }

    // Obtener los documentos de la colección
    const querySnapshot = await getDocs(q);

    // Último documento visible para la próxima paginación
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    // Mapear los datos de cada documento a un array
    const trakeoData = querySnapshot.docs.map((doc) => {
      const data = doc.data() as TrakeoData;

      return {
        id: doc.id, // Incluir el ID del documento
        dateTime: data.dateTime || "N/A",
        ip: data.ip || "N/A",
        isLogged: data.isLogged ?? false,
        isMobile: data.isMobile ?? false,
        location: data.location || "N/A",
        orientation: data.orientation || "N/A",
        platform: data.platform || "N/A",
        screenWidth: data.screenWidth || 0,
        userAgent: data.userAgent || "N/A",
      };
    });

    return {
      data: trakeoData, // Los datos paginados
      lastVisible, // El último documento para la próxima consulta
    };
  } catch (error) {
    console.error("Error fetching paginated data from trakeoKaury:", error);
    return {
      data: [],
      lastVisible: null,
    };
  }
};

// Método para obtener los primeros 10 usuarios FIREBASE
export async function getFirstTenUsers() {
  try {
    // Referencia a la colección de "users"
    const usersRef = collection(db, "users");

    // Consulta para obtener los primeros 10 documentos
    const q = query(usersRef, limit(10));

    // Ejecutar la consulta
    const querySnapshot = await getDocs(q);

    // Mapear los documentos para obtener los datos
    const usersList = querySnapshot.docs.map((doc) => ({
      id: doc.id, // ID del documento
      ...doc.data(), // Información del usuario
    }));

    return usersList;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? "0");
    const numberOfCustomers = Number(data[1].rows[0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}
