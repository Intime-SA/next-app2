"use client";

import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Order } from "@/app/lib/definitions";

ChartJS.register(ArcElement, Tooltip, Legend);

type ClientSideDiariasProps = {
  orders: Order[];
};

const sumSalesToday = (orders: Order[]) => {
  let totalSales = 0;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filteredOrders = orders.filter((order) => {
    const orderDate = order.date.toDate();
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === now.getTime();
  });

  filteredOrders.forEach((order) => {
    const total = parseFloat(order.total.toString());

    if (order.status !== "cancelada" && order.status !== "archivada") {
      totalSales += total;
    }
  });

  return totalSales;
};

export default function ClientSideDiarias({ orders }: ClientSideDiariasProps) {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const calculatedTotalSales = sumSalesToday(orders);
    setTotalSales(calculatedTotalSales);
  }, [orders]);

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

  return (
    <div className="relative w-full h-full">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">
          {totalSales.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </span>
        <span className="text-sm text-muted-foreground">Ventas</span>
      </div>
    </div>
  );
}
