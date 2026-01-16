"use client";

import { useState, useEffect, useCallback } from "react";
import { StatsData, WeightHistoryData } from "@/types";

export function useStats(period: "week" | "month" | "all" = "week") {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/stats?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const stats = await response.json();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refresh: fetchStats };
}

export function useWeightHistory(days: number = 30) {
  const [data, setData] = useState<WeightHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeight = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/weight?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch weight history");
      }
      const weight = await response.json();
      setData(weight);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    setLoading(true);
    fetchWeight();
  }, [fetchWeight]);

  return { data, loading, error, refresh: fetchWeight };
}
