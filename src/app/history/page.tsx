"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { cn, formatTime } from "@/lib/utils";
import { DailyLogData } from "@/types";
import { format, subDays, startOfDay } from "date-fns";
import { it } from "date-fns/locale";

export default function HistoryPage() {
  const [logs, setLogs] = useState<Array<{ date: string; log: DailyLogData | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const dates: string[] = [];
      const today = startOfDay(new Date());

      for (let i = 0; i < 7; i++) {
        const date = subDays(today, i);
        dates.push(format(date, "yyyy-MM-dd"));
      }

      const results = await Promise.all(
        dates.map(async (date) => {
          try {
            const response = await fetch(`/api/log/${date}`);
            if (response.ok) {
              const log = await response.json();
              return { date, log };
            }
            return { date, log: null };
          } catch {
            return { date, log: null };
          }
        })
      );

      setLogs(results);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 py-3">
        <h1 className="text-xl font-bold">Storico</h1>
        <p className="text-sm text-gray-400">Ultimi 7 giorni</p>
      </header>

      <main className="px-4">
        <div className="space-y-3">
          {logs.map(({ date, log }) => (
            <div
              key={date}
              className={cn(
                "card",
                log?.summary.percentage === 100
                  ? "border border-green-600/30"
                  : ""
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">
                    {format(new Date(date), "EEEE", { locale: it })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(date), "d MMMM", { locale: it })}
                  </p>
                </div>
                {log ? (
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      log.summary.percentage === 100
                        ? "text-green-400"
                        : log.summary.percentage >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                    )}>
                      {log.summary.percentage}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {log.summary.completedCount}/{log.summary.totalCount}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Nessun dato</span>
                )}
              </div>

              {log && (
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Sveglia</p>
                    <p className="font-medium">
                      {log.activities.wake_up?.startTime
                        ? formatTime(log.activities.wake_up.startTime)
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Peso</p>
                    <p className="font-medium">
                      {log.activities.weight?.value
                        ? `${log.activities.weight.value}kg`
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Fine</p>
                    <p className="font-medium">
                      {log.summary.routineEndTime
                        ? formatTime(log.summary.routineEndTime)
                        : "-"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Navigation />
    </div>
  );
}
