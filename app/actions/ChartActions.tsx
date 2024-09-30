"use server";

import {
  fetchTrackingData,
  fetchVisitData,
  UserActivityData,
} from "@/app/lib/data";
import { ChartDataSeguimiento } from "@/app/lib/definitions";

import { fetchUserData, User } from "@/app/lib/data";

export async function processChartData(clientDate: string) {
  console.log("Server Action called with date:", clientDate);
  try {
    const chartData = await fetchVisitData();
    console.log("Fetched chart data:", chartData.length, "items");

    const filterRecentIPs = (data: ChartDataSeguimiento[]) => {
      const clientNow = new Date(clientDate);
      const last24Hours = new Date(clientNow.getTime() - 24 * 60 * 60 * 1000);
      const uniqueIPs: Record<string, ChartDataSeguimiento> = {};

      data.forEach((item) => {
        const recordDate = new Date(item.dateTime);
        if (recordDate > last24Hours) {
          const existingRecord = uniqueIPs[item.ip];
          if (
            !existingRecord ||
            new Date(existingRecord.dateTime) < recordDate
          ) {
            uniqueIPs[item.ip] = item;
          }
        }
      });

      return Object.values(uniqueIPs);
    };

    const countUsersByHour = (data: ChartDataSeguimiento[]) => {
      const filteredData = filterRecentIPs(data);
      const counts: Record<string, { loggedIn: number; notLoggedIn: number }> =
        {};
      const clientNow = new Date(clientDate);
      const currentHour = clientNow.getHours();

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
            ((hourA - currentHour + 24) % 24) -
            ((hourB - currentHour + 24) % 24)
          );
        });
    };

    const result = countUsersByHour(chartData);
    console.log("Processed data:", result);
    return result;
  } catch (error) {
    console.error("Error in processChartData:", error);
    throw error;
  }
}

export async function processUserData() {
  const users = await fetchUserData();
  let totalUsers = 0;
  const provinceCounts: Record<string, number> = {};

  users.forEach((user) => {
    totalUsers += 1;
    const province = user?.datosEnvio?.provincia?.trim().toLowerCase();
    if (province) {
      const normalizedProvince = province.replace(/\s+/g, " ");
      provinceCounts[normalizedProvince] =
        (provinceCounts[normalizedProvince] || 0) + 1;
    }
  });

  const chartData = Object.entries(provinceCounts)
    .sort(([provinceA], [provinceB]) => provinceA.localeCompare(provinceB))
    .map(([province, count]) => {
      const normalizedProvince = province.toLowerCase().replace(/\s+/g, "-");
      const fillColor =
        normalizedProvince === "buenos-aires"
          ? "var(--color-buenos-aires)"
          : `var(--color-${normalizedProvince})`;

      return {
        province,
        count,
        fill: fillColor,
      };
    });

  return {
    totalUsers,
    chartData,
  };
}

export interface ChartData {
  deviceType: string;
  usuarios: number;
  fill: string;
}

function filterLast24Hours(data: UserActivityData[]): UserActivityData[] {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return data.filter((record) => {
    const recordDate = new Date(record.dateTime);
    return recordDate >= yesterday;
  });
}

export async function processMobileData(): Promise<ChartData[]> {
  const data = await fetchTrackingData();
  const filteredData = filterLast24Hours(data);

  const userCount: { Mobile: number; Desktop: number } = {
    Mobile: 0,
    Desktop: 0,
  };
  const countedIPs = new Set<string>();

  filteredData.forEach((record) => {
    const { isMobile, ip } = record;

    if (!countedIPs.has(ip)) {
      countedIPs.add(ip);
      const deviceType = isMobile ? "Mobile" : "Desktop";
      userCount[deviceType] += 1;
    }
  });

  return [
    {
      deviceType: "Mobile",
      usuarios: userCount.Mobile,
      fill: "var(--color-mobile)",
    },
    {
      deviceType: "Computadora",
      usuarios: userCount.Desktop,
      fill: "var(--color-desktop)",
    },
  ];
}

import { fetchUserActivityData, UserActivity } from "@/app/lib/data";

export interface ChartDataLogged {
  status: string;
  count: number;
}

function processUserDataLogged(data: UserActivity[]): ChartDataLogged[] {
  const groupedData = {
    loggedIn: 0,
    loggedOut: 0,
  };

  data.forEach((item) => {
    if (item.isLogged) {
      groupedData.loggedIn += 1;
    } else {
      groupedData.loggedOut += 1;
    }
  });

  return [
    { status: "Usuario", count: groupedData.loggedIn },
    { status: "Anonimo", count: groupedData.loggedOut },
  ];
}

export async function processUserActivityData(): Promise<ChartDataLogged[]> {
  const rawData = await fetchUserActivityData();

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const recentData = rawData.filter((entry) => {
    const entryDate = new Date(entry.dateTime);
    return entryDate >= twentyFourHoursAgo && entryDate <= now;
  });

  const uniqueUsers = recentData.reduce(
    (acc: Record<string, UserActivity>, entry) => {
      if (!acc[entry.ip]) {
        acc[entry.ip] = entry;
      }
      return acc;
    },
    {}
  );

  const processedData = Object.values(uniqueUsers);
  return processUserDataLogged(processedData);
}
