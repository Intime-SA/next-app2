"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMediaQuery } from "@mui/material";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonDemo, SkeletonPieCard } from "../charts/SkeletonLine";
import { processUserData } from "@/app/actions/ChartActions";

ChartJS.register(ArcElement, Tooltip, Legend);

const provinceColors: { [key: string]: string } = {
  "buenos aires": "#ff5733",
  caba: "#400ad5",
  cordoba: "#33ff57",
  córdoba: "#33ff57",
  "santa fe": "#3357ff",
  corrientes: "#31ab1c",
  mendoza: "#ff33a6",
  tucuman: "#ffc300",
  tucumán: "#ffc300",
  salta: "#ff5733",
  chaco: "#33ffcc",
  "entre rios": "#9933ff",
  formosa: "#ff33b5",
  "rio negro": "#ff8c00",
  neuquen: "#7fff00",
  neuquén: "#7fff00",
  misiones: "#ffffff",
  "san luis": "#ffd700",
  jujuy: "#6a5acd",
  catamarca: "#adff2f",
  "la pampa": "#00fa9a",
  "santa cruz": "#00ced1",
  "tierra del fuego": "#ff69b4",
};

const getProvinceColor = (province: string): string => {
  const normalizedProvince = province.toLowerCase().trim();
  return (
    provinceColors[normalizedProvince] ||
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );
};

export const ChartUsers: React.FC = () => {
  const [userData, setUserData] = React.useState<{
    totalUsers: number;
    chartData: Array<{ province: string; count: number; fill: string }>;
  }>({
    totalUsers: 0,
    chartData: [],
  });

  const isMobile = useMediaQuery("(max-width:600px)");
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await processUserData();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: userData.chartData.map((item) => item.province),
    datasets: [
      {
        data: userData.chartData.map((item) => item.count),
        backgroundColor: userData.chartData.map((item) =>
          getProvinceColor(item.province)
        ),
        borderColor: userData.chartData.map(() => "hsl(var(--background))"),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // This line removes the legend
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
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
      style={{
        width: "100%",
        marginTop: "1rem",
        marginRight: isMobile ? "0rem" : "1rem",
      }}
    >
      {loading ? (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "3rem",
            marginBottom: "3rem",
          }}
        >
          <SkeletonDemo />
        </div>
      ) : (
        <CardHeader className="items-center pb-0">
          <CardTitle>Usuarios por Provincia</CardTitle>
          <CardDescription>
            Datos de usuarios agrupados por provincia
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "3rem",
              marginBottom: "3rem",
            }}
          >
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        ) : (
          <div style={{ height: "400px", width: "100%" }}>
            <Pie data={chartData} options={options} />
          </div>
        )}
      </CardContent>
      {loading ? (
        <CardFooter className="flex-col items-center gap-2 text-sm">
          <SkeletonPieCard />
        </CardFooter>
      ) : (
        <CardFooter className="flex-col items-center gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Usuarios agrupados por Provincia
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Total Usuarios: {userData.totalUsers.toLocaleString()}
          </div>
          <div className="leading-none text-muted-foreground">
            Cuidado! hay provincias mal escritas...
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ChartUsers;
