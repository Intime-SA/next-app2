// ClientSideChart.tsx
"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  totalSales: number;
};

export default function ClientSideChart({ totalSales }: Props) {
  const data = {
    datasets: [
      {
        data: [totalSales, totalSales * 0.2],
        backgroundColor: ["hsl(var(--chart-2))", "transparent"],
        borderWidth: 0,
        cutout: "80%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
