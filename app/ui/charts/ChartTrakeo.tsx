"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getDocs, collection } from "firebase/firestore";
import { secondDb } from "@/app/lib/firebaseConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface UserActivity {
  dateTime: string;
  ip: string;
  isLogged: boolean;
  location: string;
  user: {
    email: string;
    rol: string;
  } | null;
  userAgent: string;
}

interface ChartData {
  location: string;
  abbreviation: string;
  count: number;
  fill: string;
}

type ChartConfigType = {
  [key: string]: {
    label: string;
    color?: string;
  };
};

const chartConfig: ChartConfigType = {
  visitors: {
    label: "Visitors",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
};

// IPs a excluir
const excludedIPs = ["192.168.1.1", "10.0.0.1"]; // Cambia estos valores según sea necesario

const generateRandomColor = (): string => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const generateAbbreviation = (location: string): string => {
  const commaIndex = location.indexOf(",");
  if (commaIndex !== -1) {
    location = location.substring(0, commaIndex).trim();
  }

  const words = location.split(" ");

  if (words.length === 1) {
    return location.substring(0, 2).toUpperCase();
  } else {
    return words.map((word) => word[0].toUpperCase()).join("");
  }
};

export default function ChartTrakeo() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(secondDb, "trakeoKaury")
        );
        const rawData: UserActivity[] = querySnapshot.docs.map(
          (doc) => doc.data() as UserActivity
        );

        const processedData = processLocationData(rawData);
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const processLocationData = (data: UserActivity[]): ChartData[] => {
    const locationCounts: Record<string, Set<string>> = {};
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentData = data.filter((entry) => {
      const entryDate = new Date(entry.dateTime);
      return entryDate >= twentyFourHoursAgo && entryDate <= now;
    });

    recentData.forEach((entry) => {
      const { location, ip } = entry;

      // Verifica si la IP está en la lista de excluidas
      if (excludedIPs.includes(ip)) return;

      if (location) {
        if (!locationCounts[location]) {
          locationCounts[location] = new Set(); // Usar un Set para almacenar IPs únicas
        }
        locationCounts[location].add(ip); // Agregar la IP al Set
      }
    });

    return Object.entries(locationCounts)
      .map(([location, ips]) => ({
        location,
        abbreviation: generateAbbreviation(location),
        count: ips.size, // Contar el número de IPs únicas
        fill: generateRandomColor(),
      }))
      .sort((a, b) => b.count - a.count); // Ordenar de mayor a menor
  };

  const chartHeight = Math.max(300, chartData.length * 40);

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
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: `${chartHeight}px` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 60, right: 20, top: 20, bottom: 20 }}
              >
                <YAxis
                  dataKey="abbreviation"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={1}
                />
                <XAxis dataKey="count" type="number" hide />
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { location, count } = payload[0].payload;
                      return (
                        <div className="bg-background border border-border p-2 rounded-md shadow-md">
                          <p className="font-medium">{location}</p>
                          <p className="text-sm text-muted-foreground">
                            Visitas: {count}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  layout="vertical"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
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
