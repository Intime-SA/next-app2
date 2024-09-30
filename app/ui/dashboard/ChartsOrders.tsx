import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ClientSideOrdersChart from "./ClientSideOrdersChart";

interface ChartData {
  date: string;
  orders: number;
  label?: string;
  uniqueIPs?: number;
}

interface OrdersChartProps {
  chartData: ChartData[];
}

const OrdersChart: React.FC<OrdersChartProps> = ({ chartData }) => {
  const isLoading = chartData.length === 0;

  return (
    <Card style={{ marginTop: "1rem" }}>
      {isLoading ? (
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
      ) : (
        <CardHeader>
          <CardTitle>Órdenes del Último Mes</CardTitle>
          <CardDescription>
            Mostrando la cantidad de órdenes por día
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className="px-2 sm:p-6">
        {isLoading ? (
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        ) : (
          <ClientSideOrdersChart chartData={chartData} />
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersChart;
