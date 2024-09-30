import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonDemo, SkeletonPieCard } from "./../charts/SkeletonLine";
import ClientSideChart from "./ClientSideChart";

type Order = {
  status: string;
  total: number;
  date: Timestamp;
  lastState: string;
};

const sumSalesLastMonth = (orders: Order[]) => {
  let totalSales = 0;
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);

  orders.forEach((order) => {
    const orderDate = order.date.toDate();
    const total = order.total;

    if (orderDate >= thirtyDaysAgo) {
      if (
        order.status !== "cancelada" &&
        order.status !== "nueva" &&
        order.status !== "archivada"
      ) {
        totalSales += total;
      } else if (
        (order.status === "archivada" && order.lastState === "enviada") ||
        order.lastState === "empaquetada" ||
        order.lastState === "pagoRecibido"
      ) {
        totalSales += total;
      }
    }
  });

  return totalSales;
};

type Props = {
  orders: Order[];
};

export function ChartTotalVentas({ orders }: Props) {
  const totalSales = sumSalesLastMonth(orders);

  return (
    <Card className="flex flex-col w-full mt-4 sm:mr-4">
      <CardHeader className="items-center pb-0">
        {!totalSales ? (
          <SkeletonDemo />
        ) : (
          <>
            <CardTitle>Ventas confirmadas</CardTitle>
            <CardDescription>últimos 30 días</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalSales === 0 ? (
          <Skeleton className="h-[250px] w-full rounded-xl" />
        ) : (
          <div className="mx-auto aspect-square max-h-[250px] relative">
            <ClientSideChart totalSales={totalSales} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">
                {totalSales.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-sm text-muted-foreground">Ventas</span>
            </div>
          </div>
        )}
      </CardContent>
      {!totalSales ? (
        <CardFooter className="flex-col gap-2 text-sm">
          <SkeletonPieCard />
        </CardFooter>
      ) : (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Total de ventas acumuladas <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Ventas del último mes
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
