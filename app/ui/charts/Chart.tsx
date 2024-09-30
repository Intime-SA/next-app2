"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Timestamp } from "firebase/firestore";

export const description = "An interactive bar chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface DeviceInfo {
  deviceInfo: {
    deviceType: string;
    language: string;
    screenResolution: string;
    userAgent: string;
  };
  email: string;
  id: string;
  ipAddress: string;
  location: string;
  name: string;
  telefono: string;
  timestamp: Timestamp;
}

interface ChartProps {
  devices: DeviceInfo[];
}

export const Chart: React.FC<ChartProps> = ({ devices }) => {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("desktop");

  // Process devices data to chart data
  const chartData = React.useMemo(() => {
    const dataMap: { [key: string]: { desktop: number; mobile: number } } = {};

    devices.forEach((device) => {
      const timestampMillis = device.timestamp.seconds * 1000; // Convert seconds to milliseconds
      const date = new Date(timestampMillis);
      const hour = date.getHours(); // Extract the hour (0-23)
      const hourKey = `${hour}:00`; // Format hour key

      // Initialize the hour entry if it doesn't exist
      if (!dataMap[hourKey]) {
        dataMap[hourKey] = { desktop: 0, mobile: 0 };
      }

      // Increment the count based on device type
      const deviceType = device.deviceInfo.deviceType.toLowerCase();
      if (deviceType.includes("win") || deviceType.includes("mac")) {
        dataMap[hourKey].desktop += 1; // Count as desktop
      } else if (
        deviceType.includes("armv81") ||
        deviceType.includes("mobile") ||
        deviceType.includes("android") ||
        deviceType.includes("iphone")
      ) {
        dataMap[hourKey].mobile += 1; // Count as mobile
      }
    });

    // Fill in missing hours with zero counts
    const fullData = Array.from({ length: 24 }, (_, i) => {
      const hourKey = `${i}:00`;
      return {
        hour: hourKey,
        desktop: dataMap[hourKey]?.desktop || 0,
        mobile: dataMap[hourKey]?.mobile || 0,
      };
    });

    return fullData;
  }, [devices]);

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    [chartData]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center px-6 py-5 sm:py-6">
          <CardTitle>
            Descargas Catalogo - <span style={{ fontWeight: "100" }}>24hs</span>
          </CardTitle>
          <br />
          <CardDescription>
            Selecciona que tipo de visita elegis ver
          </CardDescription>
        </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex-1 px-6 py-4 text-left border-t sm:border-l sm:py-6 sm:px-8"
                onClick={() => setActiveChart(chart)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span className="text-xs">{chartConfig[chart].label}</span>
                <br />
                <span className="text-lg font-bold">
                  {" "}
                  {total[chart].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="chart-class">
          <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickFormatter={(value) => value}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => value}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill={chartConfig[activeChart].color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
