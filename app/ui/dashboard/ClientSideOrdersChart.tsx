"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  date: string;
  orders: number;
  label?: string;
  uniqueIPs?: number;
}

interface ClientSideOrdersChartProps {
  chartData: ChartData[];
}

const ClientSideOrdersChart: React.FC<ClientSideOrdersChartProps> = ({
  chartData,
}) => {
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    const zonedDate = toZonedTime(date, "America/Argentina/Buenos_Aires");
    return format(zonedDate, "d MMM", { locale: es });
  };

  const labels = chartData.map((data) => formatDate(data.date));
  const orderData = chartData.map((data) => data.orders);

  const data = {
    labels,
    datasets: [
      {
        label: "Órdenes",
        data: orderData,
        backgroundColor: "rgba(0, 123, 255, 0.6)", // Cambiado a un azul semi-transparente
        borderColor: "rgba(0, 123, 255, 1)", // Borde azul sólido
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            return `Fecha: ${context[0].label}`;
          },
          label: (context: any) => {
            return `Órdenes: ${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="aspect-auto h-[250px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ClientSideOrdersChart;
