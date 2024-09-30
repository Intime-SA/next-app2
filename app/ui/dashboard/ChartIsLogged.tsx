"use client";

import React, { useState, useEffect } from "react";
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
import { SkeletonDemo } from "../charts/SkeletonLine";
import {
  ChartDataLogged,
  processUserActivityData,
} from "@/app/actions/ChartActions";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  const data = {
    labels: chartData.map((item) =>
      item.status === "Usuario" ? "Logeados" : "No Logeados"
    ),
    datasets: [
      {
        label: "Usuarios",
        data: chartData.map((item) => item.count),
        backgroundColor: chartData.map(
          (item) =>
            item.status === "Usuario"
              ? "hsl(190, 90%, 50%)" // Bright cyan for logged-in users
              : "hsl(330, 90%, 60%)" // Vibrant pink for anonymous users
        ),
        borderColor: chartData.map(
          (item) =>
            item.status === "Usuario"
              ? "hsl(190, 90%, 40%)" // Slightly darker cyan for border
              : "hsl(330, 90%, 50%)" // Slightly darker pink for border
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label =
              context.label === "Logeados" ? "Logeados" : "Anonimos";
            return `${label}: ${context.parsed.y}`;
          },
        },
        backgroundColor: "hsl(var(--background))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "hsl(var(--foreground))",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "hsl(var(--foreground))",
        },
        grid: {
          color: "hsl(var(--border))",
        },
      },
    },
  };

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
          <div style={{ height: "300px" }}>
            <Bar data={data} options={options} />
          </div>
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

export default ChartIsLogged;
