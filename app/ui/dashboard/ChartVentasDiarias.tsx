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
import ClientSideDiarias from "./ClientChartDiarias";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonDemo, SkeletonPieCard } from "./../charts/SkeletonLine";

type Props = {
  orders: Order[];
};

export function ChartVentasDiarias({ orders }: Props) {
  const isLoading = orders.length === 0;

  return (
    <Card className="flex flex-col w-full mt-4 sm:mr-4">
      <CardHeader className="items-center pb-0">
        {isLoading ? (
          <SkeletonDemo />
        ) : (
          <>
            <CardTitle>Ordenes de venta</CardTitle>
            <CardDescription>del día de hoy</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full rounded-xl" />
        ) : (
          <div className="mx-auto aspect-square max-h-[250px]">
            <ClientSideDiarias orders={orders} />
          </div>
        )}
      </CardContent>
      {isLoading ? (
        <CardFooter className="flex-col gap-2 text-sm">
          <SkeletonPieCard />
        </CardFooter>
      ) : (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Total de ventas del día <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Confirmadas y no confirmadas
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
