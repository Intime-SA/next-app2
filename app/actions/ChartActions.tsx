"use server";

import { fetchVisitData } from "@/app/lib/data";
import { ChartDataSeguimiento } from "@/app/lib/definitions";

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
