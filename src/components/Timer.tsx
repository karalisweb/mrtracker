"use client";

import { useState, useEffect } from "react";
import { formatDurationFromMs } from "@/lib/utils";

interface TimerProps {
  startTime: string;
  isActive: boolean;
}

export function Timer({ startTime, isActive }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive || !startTime) return;

    const start = new Date(startTime).getTime();

    const updateElapsed = () => {
      setElapsed(Date.now() - start);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  if (!isActive) return null;

  return (
    <span className="font-mono text-lg font-bold">
      {formatDurationFromMs(elapsed)}
    </span>
  );
}
