"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { processChartData } from "@/app/actions/ChartActions";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type UserCountData = {
  hour: string;
  loggedIn: number;
  notLoggedIn: number;
};

export function ChartVisitas() {
  const [userCountsByHour, setUserCountsByHour] = useState<UserCountData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const clientDate = new Date().toISOString();
        const data = await processChartData(clientDate);
        setUserCountsByHour(data);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const data = {
    labels: userCountsByHour.map((item) => item.hour),
    datasets: [
      {
        label: "Logeados",
        data: userCountsByHour.map((item) => item.loggedIn),
        borderColor: "rgba(75, 192, 192, 0.8)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: "Anónimos",
        data: userCountsByHour.map((item) => item.notLoggedIn),
        borderColor: "rgba(255, 99, 132, 0.8)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0,0,0,0.7)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "white",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(200, 200, 200, 0.2)",
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 20,
        bottom: 10,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[calc(100vh-200px)] mt-4">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardHeader>
        <CardContent className="p-6 h-[calc(100%-100px)]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  if (userCountsByHour.length === 0) {
    return (
      <Card className="w-full h-[calc(100vh-200px)] mt-4">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Estadísticas en vivo</CardTitle>
            <CardDescription>
              No hay datos disponibles en este momento.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent
          style={{ width: "100%", height: "500px" }}
          className="flex items-center justify-center"
        >
          <p>No hay datos para mostrar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[calc(100vh-200px)] mt-4">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Estadísticas en vivo</CardTitle>
          <CardDescription>
            Usuarios logeados y anónimos en las últimas 24hs
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent style={{ width: "100%", height: "500px" }}>
        <div className="w-full h-full" style={{ position: "relative" }}>
          <Line options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
