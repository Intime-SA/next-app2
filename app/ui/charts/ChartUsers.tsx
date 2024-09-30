"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebaseConfig";
import { useMediaQuery } from "@mui/material";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonDemo, SkeletonPieCard } from "./SkeletonLine";

interface User {
  datosEnvio?: {
    provincia?: string;
  };
}

export const ChartUsers: React.FC = () => {
  const [userData, setUserData] = React.useState<{
    totalUsers: number;
    usersByProvince: Record<string, number>;
  }>({
    totalUsers: 0,
    usersByProvince: {},
  });

  const isMobile = useMediaQuery("(max-width:600px)");

  const [loading, setLoading] = React.useState<boolean>(true); // Estado de carga

  React.useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      let totalUsers = 0;
      const provinceCounts: Record<string, number> = {};

      querySnapshot.forEach((doc) => {
        const user = doc.data() as User;
        totalUsers += 1;

        const province = user?.datosEnvio?.provincia?.trim().toLowerCase();
        if (province) {
          const normalizedProvince = province.replace(/\s+/g, " ");
          provinceCounts[normalizedProvince] =
            (provinceCounts[normalizedProvince] || 0) + 1;
        }
      });

      setUserData({
        totalUsers,
        usersByProvince: provinceCounts,
      });
      setLoading(false); // Actualizar el estado de carga
    };

    fetchUsers();
  }, []);

  const chartData = Object.entries(userData.usersByProvince)
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

  return (
    <Card
      style={{
        width: "100%",
        marginTop: "1rem",
        marginRight: isMobile ? "0rem" : "1rem",
      }}
    >
      {" "}
      {loading ? ( // Muestra el loading si aún se están cargando los datos
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
        {loading ? ( // Muestra el loading si aún se están cargando los datos
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
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="province"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {userData.totalUsers.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total Usuarios
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
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
            Cuidado! hay provincias mal escritas...
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ChartUsers;
