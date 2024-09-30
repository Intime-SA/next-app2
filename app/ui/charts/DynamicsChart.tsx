"use client";

import {
  RadialBarChart,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  Label,
} from "recharts";

type DynamicChartProps = {
  chartData: Array<{ name: string; visitors: number; fill: string }>;
  totalSales: number;
};

export default function DynamicChart({
  chartData,
  totalSales,
}: DynamicChartProps) {
  return (
    <RadialBarChart
      data={chartData}
      startAngle={0}
      endAngle={250}
      innerRadius={80}
      outerRadius={110}
      barSize={30}
    >
      <PolarGrid
        gridType="circle"
        radialLines={false}
        stroke="none"
        className="first:fill-muted last:fill-background"
        polarRadius={[86, 74]}
      />
      <RadialBar
        dataKey="visitors"
        background
        cornerRadius={10}
        fill="var(--color-safari)"
      />
      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                    className="fill-foreground text-2xl font-bold"
                  >
                    {totalSales.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) + 20}
                    className="fill-muted-foreground text-sm"
                  >
                    Ventas
                  </tspan>
                </text>
              );
            }
          }}
        />
      </PolarRadiusAxis>
    </RadialBarChart>
  );
}
