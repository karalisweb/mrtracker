"use client";

import { useState, useCallback } from "react";
import { ActivityAction } from "@/types";

export function useActivity(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = useCallback(
    async (action: ActivityAction) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(action),
        });

        if (!response.ok) {
          throw new Error("Failed to perform action");
        }

        if (onSuccess) {
          onSuccess();
        }

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  const startActivity = useCallback(
    (activityId: string) => {
      return performAction({ activityId, action: "start" });
    },
    [performAction]
  );

  const stopActivity = useCallback(
    (activityId: string, notes?: string) => {
      return performAction({ activityId, action: "stop", notes });
    },
    [performAction]
  );

  const setWeight = useCallback(
    (value: number) => {
      return performAction({ activityId: "weight", action: "set_value", value });
    },
    [performAction]
  );

  const setWakeUp = useCallback(
    (sleepQuality: number) => {
      return performAction({
        activityId: "wake_up",
        action: "set_time",
        sleepQuality,
      });
    },
    [performAction]
  );

  const setTime = useCallback(
    (activityId: string) => {
      return performAction({
        activityId,
        action: "set_time",
      });
    },
    [performAction]
  );

  const skipActivity = useCallback(
    (activityId: string) => {
      return performAction({ activityId, action: "skip" });
    },
    [performAction]
  );

  const resetActivity = useCallback(
    (activityId: string) => {
      return performAction({ activityId, action: "reset" });
    },
    [performAction]
  );

  return {
    loading,
    error,
    startActivity,
    stopActivity,
    setWeight,
    setWakeUp,
    setTime,
    skipActivity,
    resetActivity,
  };
}
