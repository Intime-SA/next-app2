"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartDataTrakeo,
  processLocationData,
} from "@/app/actions/ChartActions";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function ChartTrakeo() {
  const [chartData, setChartData] = useState<ChartDataTrakeo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const processedData = await processLocationData();
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching or processing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels: chartData.map((item) => item.abbreviation),
    datasets: [
      {
        label: "Visitas",
        data: chartData.map((item) => item.count),
        backgroundColor: chartData.map((item) => item.fill),
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = chartData[context.dataIndex].location;
            const value = context.parsed.x;
            return `${label}: ${value} visitas`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Número de visitas",
        },
      },
      y: {
        title: {
          display: true,
          text: "Localidad",
        },
      },
    },
  };

  return (
    <Card className="w-full mb-4" style={{ marginTop: "1rem" }}>
      <CardHeader>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </>
        ) : (
          <>
            <CardTitle>Estadísticas por Localidad</CardTitle>
            <CardDescription>
              Distribución de usuarios por localidad -{" "}
              <span className="font-light">(últimas 24hs)</span>
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent style={{ width: "100%" }}>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div
            style={{
              height: `${Math.max(300, chartData.length * 40)}px`,
              width: "100%",
              marginLeft: "-3rem",
            }}
          >
            <Bar style={{ width: "100vw" }} data={data} options={options} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </>
        ) : (
          <>
            <div className="flex gap-2 font-medium leading-none">
              Estadísticas basadas en visitas a la WEB{" "}
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Distribución de usuarios únicos por localidad.
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default ChartTrakeo;
