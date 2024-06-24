"use client";
import React from "react";
import { GlobalProvider } from "../../providers/GlobalProvider";
import { config } from "dotenv";
import DataPage from "@/pgs/DataPage";

export default function Data() {
  config();
  if (typeof window !== "undefined") {
    return (
      <GlobalProvider>
        <DataPage />
      </GlobalProvider>
    );
  }
}
