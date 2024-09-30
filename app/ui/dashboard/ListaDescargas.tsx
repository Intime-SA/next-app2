"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import ChartsOrders from "./ChartsOrders";
import { ChartTotalVentas } from "./ChartTotalVentas";
import { ChartTotalHistorico } from "./ChartTotalHistorico";
import { ChartVentasDiarias } from "./ChartVentasDiarias";
import { fetchOrdersData } from "@/app/lib/data"; // Asegúrate de importar tu función
import { ChartData, Order } from "@/app/lib/definitions";
import { ChartVisitas } from "./ChartVisitas";

const TrakeoAlimentosNaturales: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { orders, chartData } = await fetchOrdersData(); // Llamar a la función
        console.log(orders);
        setOrders(orders);
        setChartData(chartData);
      } catch (error) {
        console.error("Error fetching orders data:", error);
      } finally {
        setLoading(false); // Asegúrate de que el loading se detenga
      }
    };

    fetchOrders();
  }, []);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "1rem",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            marginLeft: isMobile ? "0rem" : "5rem",
          }}
        >
          <img
            src="https://firebasestorage.googleapis.com/v0/b/mayoristakaurymdp.appspot.com/o/Pesta%C3%B1aLogo%2FSinFondoLogo.png?alt=media&token=8a59df40-df50-4c65-8677-43a9fee55622"
            alt="atlantics.dev"
            style={{ width: isMobile ? "50px" : "100px" }}
          />
          |
          <h1
            style={{
              marginLeft: isMobile ? "1rem" : "5rem",
              fontSize: isMobile ? "0.7rem" : "1.5rem",
              fontWeight: "bold",
              marginRight: "0rem",
            }}
          >
            Estadisticas : <span style={{ fontWeight: "900" }}>Kaury</span>
          </h1>
        </div>

        <div style={{ marginRight: isMobile ? "0rem" : "5rem" }}>
          <Switch
            checked={isDarkMode}
            onChange={() => setIsDarkMode((prev) => !prev)}
          />
        </div>
      </div>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <ChartVentasDiarias orders={orders} />
        <ChartTotalVentas orders={orders} />
        <ChartTotalHistorico orders={orders} />
      </div>
      <div
        style={{
          width: "100%",
        }}
      >
        <ChartsOrders chartData={chartData} />
        {/* <ChartVisitas /> */}
      </div>
      {/* <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: isMobile ? "center" : "space-between",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <ChartUsers />
        <ChartsMobile />
        <ChartIsLogged />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-start",
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
        }}
      >
        <ChartTrakeo />
      </div> */}
    </div>
  );
};

export default TrakeoAlimentosNaturales;
