"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Data() {

  const router = useRouter();

  useEffect(() => {
    router.push("/map");
  }, []);
}
