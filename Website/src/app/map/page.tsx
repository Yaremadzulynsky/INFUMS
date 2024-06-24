"use client";
import React from "react";
import HomePage from "../../pgs/HomePage";
import { GlobalProvider } from "../../providers/GlobalProvider";
import { config } from "dotenv";

export default function Home() {
  config();

  if (typeof window !== "undefined") {
    return (
      <GlobalProvider>
        <HomePage />
      </GlobalProvider>
    );
  }
}
