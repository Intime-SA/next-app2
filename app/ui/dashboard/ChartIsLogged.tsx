"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonDemo } from "../charts/SkeletonLine";
import {
  ChartDataLogged,
  processUserActivityData,
} from "@/app/actions/ChartActions";

const chartConfig = {
  count: {
    label: "Usuarios ",
  },
} satisfies ChartConfig;

export function ChartIsLogged() {
  const [chartData, setChartData] = useState<ChartDataLogged[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await processUserActivityData();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card
      style={{
        width: "100%",
        marginTop: "1rem",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {loading ? (
        <CardHeader
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <SkeletonDemo />
        </CardHeader>
      ) : (
        <CardHeader>
          <CardTitle>Estado de Sesión de Usuarios</CardTitle>
          <CardDescription>
            Usuarios navegan Logeados o Anonimos{" "}
            <span style={{ fontWeight: "100" }}> - (ultimas 24hs)</span>
          </CardDescription>
        </CardHeader>
      )}

      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] w-full rounded-xl" />
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="status" />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel hideIndicator />}
              />
              <Bar dataKey="count">
                <LabelList position="top" dataKey="count" fillOpacity={1} />
                {chartData.map((item) => (
                  <Cell
                    key={item.status}
                    fill={
                      item.status === "Usuario"
                        ? "hsl(var(--chart-1))"
                        : "hsl(var(--chart-2))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>

      {loading ? (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <SkeletonDemo />
        </CardFooter>
      ) : (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Usuario anonimo se traduce en cliente nuevo
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Mostrando el estado de sesión de usuarios en dos grupos
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
