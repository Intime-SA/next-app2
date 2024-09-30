"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useMediaQuery } from "@mui/material";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartData, processMobileData } from "@/app/actions/ChartActions";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const defaultData: ChartData[] = [
  { deviceType: "Mobile", usuarios: 0, fill: "hsl(215, 100%, 60%)" },
  { deviceType: "Desktop", usuarios: 0, fill: "hsl(145, 80%, 50%)" },
];

export function ChartsMobile() {
  const [chartData, setChartData] = useState<ChartData[]>(defaultData);
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await processMobileData();
        setChartData(
          data.map((item) => ({
            ...item,
            fill:
              item.deviceType === "Mobile"
                ? "hsl(215, 100%, 60%)"
                : "hsl(145, 80%, 50%)",
          }))
        );
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalusuarios = chartData.reduce((sum, item) => sum + item.usuarios, 0);

  const data = {
    labels: chartData.map((item) => item.deviceType),
    datasets: [
      {
        data: chartData.map((item) => item.usuarios),
        backgroundColor: chartData.map((item) => item.fill),
        borderColor: chartData.map((item) => item.fill),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "hsl(var(--foreground))",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${value} usuarios`;
          },
        },
        backgroundColor: "hsl(var(--background))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
      },
    },
  };

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
          <div className="relative mx-auto aspect-square max-h-[300px]">
            <Pie data={data} options={options} />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ pointerEvents: "none" }}
            >
              <span className="text-3xl font-bold">
                {totalusuarios.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                Total Usuarios
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartsMobile;
