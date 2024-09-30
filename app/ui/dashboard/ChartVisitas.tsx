"use client";

import React, { useEffect, useState, useMemo } from "react";
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
} from "chart.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { collection, getDocs } from "firebase/firestore";
import { secondDb } from "@/app/lib/firebaseConfig";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ChartData = {
  dateTime: string;
  ip: string;
  isLogged: boolean;
  location: string;
  user: null;
  userAgent: string;
};

export function ChartVisitas() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisitData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(secondDb, "trakeoKaury")
        );
        const data = querySnapshot.docs.map((doc) => doc.data() as ChartData);
        setChartData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitData();
  }, []);

  const filterRecentIPs = (data: ChartData[]) => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const uniqueIPs: Record<string, ChartData> = {};

    data.forEach((item) => {
      const recordDate = new Date(item.dateTime);
      if (recordDate > last24Hours) {
        const existingRecord = uniqueIPs[item.ip];
        if (!existingRecord || new Date(existingRecord.dateTime) < recordDate) {
          uniqueIPs[item.ip] = item;
        }
      }
    });

    return Object.values(uniqueIPs);
  };

  const countUsersByHour = (data: ChartData[]) => {
    const filteredData = filterRecentIPs(data);
    const counts: Record<string, { loggedIn: number; notLoggedIn: number }> =
      {};
    const now = new Date();
    const currentHour = now.getHours();

    for (let i = 24; i > 0; i--) {
      const hour = (currentHour - i + 24) % 24;
      counts[hour] = { loggedIn: 0, notLoggedIn: 0 };
    }

    filteredData.forEach((item) => {
      const date = new Date(item.dateTime);
      const hour = date.getHours();

      if (counts[hour] !== undefined) {
        if (item.isLogged) {
          counts[hour].loggedIn += 1;
        } else {
          counts[hour].notLoggedIn += 1;
        }
      }
    });

    return Object.entries(counts)
      .map(([hour, count]) => ({
        hour: `${hour.padStart(2, "0")}:00`,
        loggedIn: count.loggedIn,
        notLoggedIn: count.notLoggedIn,
      }))
      .sort((a, b) => {
        const hourA = parseInt(a.hour);
        const hourB = parseInt(b.hour);
        return (
          ((hourA - currentHour + 24) % 24) - ((hourB - currentHour + 24) % 24)
        );
      });
  };

  const userCountsByHour = useMemo(
    () => countUsersByHour(chartData),
    [chartData]
  );

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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
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
        mode: "index" as const,
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
      mode: "nearest" as const,
      axis: "x" as const,
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