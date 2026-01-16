"use client";

import { useState, useEffect, useCallback } from "react";
import { DailyLogData } from "@/types";

export function useDailyLog() {
  const [data, setData] = useState<DailyLogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLog = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/log");
      if (!response.ok) {
        throw new Error("Failed to fetch log");
      }
      const log = await response.json();
      setData(log);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchLog();
  }, [fetchLog]);

  return { data, loading, error, refresh };
}
