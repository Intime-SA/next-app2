"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@mui/material";

export const ThemeSwitcher = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <Switch
      checked={isDarkMode}
      onChange={() => setIsDarkMode((prev) => !prev)}
    />
  );
};
