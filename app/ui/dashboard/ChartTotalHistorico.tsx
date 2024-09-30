import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Order } from "@/app/lib/definitions";
import ClientSideChart from "./ClientSideChart";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonDemo, SkeletonPieCard } from "./../charts/SkeletonLine";

type Props = {
  orders: Order[];
};

const sumTotalSales = (orders: Order[]) => {
  return orders.reduce((totalSales, order) => {
    const isValidTotal = typeof order.total === "number";
    const isActiveOrder =
      order.status !== "cancelada" &&
      order.status !== "nueva" &&
      order.status !== "archivada";
    const isArchivedOrder =
      (order.status === "archivada" &&
        order.lastState !== "cancelada" &&
        order.lastState !== "nueva" &&
        order.lastState !== "archivada" &&
        order.lastState === "empaquetada") ||
      order.lastState === "enviada" ||
      order.lastState === "pagoRecibido";

    return (isActiveOrder || isArchivedOrder) && isValidTotal
      ? totalSales + order.total
      : totalSales;
  }, 0);
};

export function ChartTotalHistorico({ orders }: Props) {
  const totalSales = sumTotalSales(orders);

  return (
    <Card className="flex flex-col w-full mt-4">
      <CardHeader className="items-center pb-0">
        {!totalSales ? (
          <SkeletonDemo />
        ) : (
          <>
            <CardTitle>Ventas Confirmadas</CardTitle>
            <CardDescription>Historico</CardDescription>
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
            Ventas total historico (01/04/2024)
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
