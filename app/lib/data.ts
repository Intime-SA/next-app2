import { sql } from "@vercel/postgres";
import {
  ChartData,
  ChartDataSeguimiento,
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

// Interfaces
export interface User {
  datosEnvio?: {
    provincia?: string;
  };
}

export interface UserActivityData {
  isMobile: boolean;
  ip: string;
  dateTime: string;
}

export interface UserActivity {
  dateTime: string;
  ip: string;
  isLogged: boolean;
  location: string;
  user: {
    email: string;
    rol: string;
  } | null;
  userAgent: string;
}

export interface ChartDataSeguimientoL {
  dateTime: string;
  ip: string;
  isLogged: boolean;
  location: string;
  user: null;
  userAgent: string;
}

export interface UserActivityDataLocalidades {
  dateTime: string;
  ip: string;
  isLogged: boolean;
  isMobile: boolean;
  location: string;
  user: {
    email: string;
    rol: string;
  } | null;
  userAgent: string;
}

// Cache para almacenar los datos
let cachedDbData: any[] = [];
let cachedSecondDbData: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para obtener datos de la base de datos principal
async function fetchDbData() {
  if (Date.now() - lastFetchTime < CACHE_DURATION && cachedDbData.length > 0) {
    return cachedDbData;
  }
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    cachedDbData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    lastFetchTime = Date.now();
    return cachedDbData;
  } catch (error) {
    console.error("Error fetching data from main database:", error);
    return [];
  }
}

// Función para obtener datos de la base de datos secundaria
async function fetchSecondDbData() {
  if (
    Date.now() - lastFetchTime < CACHE_DURATION &&
    cachedSecondDbData.length > 0
  ) {
    return cachedSecondDbData;
  }
  try {
    const querySnapshot = await getDocs(collection(secondDb, "trakeoKaury"));
    cachedSecondDbData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    lastFetchTime = Date.now();
    return cachedSecondDbData;
  } catch (error) {
    console.error("Error fetching data from secondary database:", error);
    return [];
  }
}

export async function fetchUserActivityDataLocalidades(): Promise<
  UserActivityDataLocalidades[]
> {
  const data = await fetchSecondDbData();
  return data;
}

// Funciones de fetch existentes refactorizadas
export async function fetchVisitData(): Promise<ChartDataSeguimientoL[]> {
  const data = await fetchSecondDbData();
  return data as ChartDataSeguimientoL[];
}

export async function fetchUserData(): Promise<User[]> {
  const data = await fetchDbData();
  return data as User[];
}

export async function fetchTrackingData(): Promise<UserActivityData[]> {
  const data = await fetchSecondDbData();
  return data as UserActivityData[];
}

export async function fetchUserActivityData(): Promise<UserActivity[]> {
  const data = await fetchSecondDbData();
  return data as UserActivity[];
}

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

// Interfaz para el resultado paginado
interface PaginatedResult {
  data: TrakeoData[];
  lastVisible: any;
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
  const data = await fetchDbData();
  return data.slice(0, 10);
}
