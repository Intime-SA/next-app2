"use client";

import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  Label,
  Sector,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { useMediaQuery } from "@mui/material";
import { secondDb } from "@/app/lib/firebaseConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface UserActivityData {
  isMobile: boolean;
  ip: string;
  dateTime: string;
}

interface ChartData {
  deviceType: string;
  usuarios: number;
  fill: string;
}

const defaultData: ChartData[] = [
  { deviceType: "Mobile", usuarios: 0, fill: "var(--color-mobile)" },
  { deviceType: "Desktop", usuarios: 0, fill: "var(--color-desktop)" },
];

const chartConfig = {
  usuarios: { label: "Usuarios" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-1))" },
  desktop: { label: "Computadora", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const fetchTrackingData = async (): Promise<UserActivityData[]> => {
  try {
    const querySnapshot = await getDocs(collection(secondDb, "trakeoKaury"));
    return querySnapshot.docs.map((doc) => doc.data() as UserActivityData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

const filterLast24Hours = (data: UserActivityData[]): UserActivityData[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return data.filter((record) => {
    const recordDate = new Date(record.dateTime);
    return recordDate >= yesterday;
  });
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div className="bg-background p-2 border border-border rounded shadow">
        <p className="font-bold">{data.deviceType}</p>
        <p>Usuarios: {data.usuarios}</p>
      </div>
    );
  }
  return null;
};

export function ChartsMobile() {
  const [chartData, setChartData] = useState<ChartData[]>(defaultData);
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    async function loadData() {
      try {
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

        const mappedData: ChartData[] = [
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

        setChartData(mappedData);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalusuarios = chartData.reduce((sum, item) => sum + item.usuarios, 0);

  return (
    <Card
      className="flex flex-col"
      style={{
        width: "100%",
        marginTop: "1rem",
        marginRight: isMobile ? "0rem" : "1rem",
      }}
    >
      <CardHeader className="items-center pb-0">
        {loading ? (
          <>
            <Skeleton
              className="h-4 w-[150px]"
              style={{ marginBottom: "2rem" }}
            />
          </>
        ) : (
          <>
            <CardTitle>Mobile vs Computadora</CardTitle>
            <CardDescription>Datos ultimas 24hs</CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="usuarios"
                  nameKey="deviceType"
                  innerRadius={60}
                  outerRadius={80}
                  labelLine={false}
                  fill="#8884d8"
                >
                  {chartData.map((entry, index) => (
                    <Sector
                      key={`sector-${index}`}
                      fill={entry.fill}
                      strokeWidth={5}
                    />
                  ))}
                  <Label
                    value={totalusuarios.toLocaleString()}
                    position="center"
                    className="text-3xl font-bold fill-foreground"
                  />
                  <Label
                    value=""
                    position="center"
                    className="text-xs fill-muted-foreground"
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
