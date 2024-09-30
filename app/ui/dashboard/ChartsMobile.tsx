"use client";

import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  Label,
  Sector,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useMediaQuery } from "@mui/material";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartData, processMobileData } from "@/app/actions/ChartActions";

const defaultData: ChartData[] = [
  { deviceType: "Mobile", usuarios: 0, fill: "var(--color-mobile)" },
  { deviceType: "Desktop", usuarios: 0, fill: "var(--color-desktop)" },
];

const chartConfig = {
  usuarios: { label: "Usuarios" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-1))" },
  desktop: { label: "Computadora", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div className="bg-background p-2 border border-border rounded shadow">
        <p className="font-bold">{data.deviceType}</p>
        <p>Usuarios: {data.usuarios}</p>
      </div>
    );
  }
  return null;
};

export function ChartsMobile() {
  const [chartData, setChartData] = useState<ChartData[]>(defaultData);
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await processMobileData();
        setChartData(data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalusuarios = chartData.reduce((sum, item) => sum + item.usuarios, 0);

  return (
    <Card
      className="flex flex-col"
      style={{
        width: "100%",
        marginTop: "1rem",
        marginRight: isMobile ? "0rem" : "1rem",
      }}
    >
      <CardHeader className="items-center pb-0">
        {loading ? (
          <>
            <Skeleton
              className="h-4 w-[150px]"
              style={{ marginBottom: "2rem" }}
            />
          </>
        ) : (
          <>
            <CardTitle>Mobile vs Computadora</CardTitle>
            <CardDescription>Datos ultimas 24hs</CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="usuarios"
                  nameKey="deviceType"
                  innerRadius={60}
                  outerRadius={80}
                  labelLine={false}
                  fill="#8884d8"
                >
                  {chartData.map((entry, index) => (
                    <Sector
                      key={`sector-${index}`}
                      fill={entry.fill}
                      strokeWidth={5}
                    />
                  ))}
                  <Label
                    value={totalusuarios.toLocaleString()}
                    position="center"
                    className="text-3xl font-bold fill-foreground"
                  />
                  <Label
                    value=""
                    position="center"
                    className="text-xs fill-muted-foreground"
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
