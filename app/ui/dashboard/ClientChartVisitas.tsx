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
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Anónimos",
        data: userCountsByHour.map((item) => item.notLoggedIn),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  if (isLoading) {
    return (
      <Card style={{ marginTop: "1rem" }}>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ marginTop: "1rem" }}>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Estadísticas en vivo</CardTitle>
          <CardDescription>
            Usuarios logeados y anónimos en las últimas 24hs
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="aspect-auto h-[250px] w-full">
          <Line options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
