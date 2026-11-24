
"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/lib/api";

type ConnectionStatus =
  | "checking"
  | "connected"
  | "disconnected";

export default function BackendStatus() {
  const [status, setStatus] =
    useState<ConnectionStatus>("checking");

  useEffect(() => {
    async function verifyConnection() {
      try {
        const result = await checkBackendHealth();

        if (result.status === "UP") {
          setStatus("connected");
        } else {
          setStatus("disconnected");
        }
      } catch {
        setStatus("disconnected");
      }
    }

    verifyConnection();
  }, []);

  const statusDetails = {
    checking: {
      label: "Checking backend...",
      color: "bg-yellow-500",
    },
    connected: {
      label: "Backend connected",
      color: "bg-green-500",
    },
    disconnected: {
      label: "Backend unavailable",
      color: "bg-red-500",
    },
  };

  const current = statusDetails[status];

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <span
        className={`h-2.5 w-2.5 rounded-full ${current.color}`}
      />

      <span className="text-xs font-medium text-neutral-500">
        {current.label}
      </span>
    </div>
  );
}