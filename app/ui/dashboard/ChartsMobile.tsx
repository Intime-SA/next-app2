"use client";

import { useEffect, useState, useRef } from "react";
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
  Plugin,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const colorPalette = [
  "hsl(215, 100%, 60%)", // Blue
  "hsl(145, 80%, 50%)", // Green
  "hsl(0, 100%, 65%)", // Red
  "hsl(45, 100%, 50%)", // Yellow
  "hsl(280, 100%, 65%)", // Purple
  "hsl(180, 100%, 40%)", // Teal
];

const defaultData: ChartData[] = [
  { deviceType: "Mobile", usuarios: 0, fill: colorPalette[0] },
  { deviceType: "Desktop", usuarios: 0, fill: colorPalette[1] },
  { deviceType: "Tablet", usuarios: 0, fill: colorPalette[2] },
  { deviceType: "Smart TV", usuarios: 0, fill: colorPalette[3] },
  { deviceType: "Game Console", usuarios: 0, fill: colorPalette[4] },
  { deviceType: "Other", usuarios: 0, fill: colorPalette[5] },
];

export function ChartsMobile() {
  const [chartData, setChartData] = useState<ChartData[]>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<"pie">>(null);

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await processMobileData();
        if (data && data.length > 0) {
          setChartData(
            data.map((item, index) => ({
              ...item,
              fill: colorPalette[index % colorPalette.length],
            }))
          );
        } else {
          setError("No se encontraron datos");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
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

  const labelPlugin: Plugin<"pie"> = {
    id: "labelPlugin",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const { chartArea } = chart;

      if (!ctx || !chartArea) return;

      ctx.save();
      ctx.font = "bold 12px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      try {
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          meta.data.forEach((element: any, index: number) => {
            if (typeof element.getCenterPoint === "function") {
              const { x, y } = element.getCenterPoint();
              const deviceType = chartData[index].deviceType;
              ctx.fillText(deviceType, x, y);
            }
          });
        });
      } catch (error) {
        console.error("Error drawing chart labels:", error);
      }

      ctx.restore();
    },
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "hsl(var(--foreground))",
          font: {
            size: 14,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            const percentage = ((value / totalusuarios) * 100).toFixed(1);
            return `${label}: ${value.toLocaleString()} usuarios (${percentage}%)`;
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
    <Card className="flex flex-col w-full mt-4 md:mr-4">
      <CardHeader className="items-center pb-2">
        {loading ? (
          <Skeleton className="h-6 w-[200px] mb-2" />
        ) : (
          <>
            <CardTitle className="text-xl font-bold">
              Dispositivos de Usuarios
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Datos últimas 24hs
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-4">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] text-center text-muted-foreground">
            {error}
          </div>
        ) : (
          <div className="relative mx-auto w-full h-[300px]">
            <Pie data={data} options={options} plugins={[labelPlugin]} />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              aria-hidden="true"
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
