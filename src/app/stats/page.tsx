"use client";

import { useState } from "react";
import { useStats, useWeightHistory } from "@/hooks/useStats";
import { getActivityById } from "@/lib/activities";
import { Navigation } from "@/components/Navigation";
import { StatsCard } from "@/components/StatsCard";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "all";

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const { data, loading } = useStats(period);
  const { data: weightData } = useWeightHistory(30);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Caricamento...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Errore nel caricamento</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 py-3">
        <h1 className="text-xl font-bold">Statistiche</h1>
      </header>

      <main className="px-4">
        <div className="flex gap-2 mb-6">
          {(["week", "month", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400"
              )}
            >
              {p === "week" ? "Settimana" : p === "month" ? "Mese" : "Tutto"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatsCard
            label="Completamento"
            value={`${data.completionRate}%`}
            icon="check"
          />
          <StatsCard
            label="Streak attuale"
            value={`${data.currentStreak} gg`}
            icon="calendar"
          />
          <StatsCard
            label="Sveglia media"
            value={data.avgWakeUpTime || "-"}
            icon="clock"
          />
          <StatsCard
            label="Durata media"
            value={data.avgRoutineDuration ? `${data.avgRoutineDuration}m` : "-"}
            icon="clock"
          />
        </div>

        <div className="card mb-6">
          <h3 className="text-sm text-gray-400 mb-3">Peso</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">
                {data.weight.current?.toFixed(1) || "-"} kg
              </p>
              <p className="text-sm text-gray-400">Attuale</p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-lg font-semibold",
                data.weight.trend === "down" ? "text-green-400" :
                data.weight.trend === "up" ? "text-red-400" : "text-gray-400"
              )}>
                {data.weight.weekAgo
                  ? `${data.weight.current && data.weight.weekAgo
                      ? (data.weight.current - data.weight.weekAgo > 0 ? "+" : "")
                      : ""}${
                      data.weight.current && data.weight.weekAgo
                        ? (data.weight.current - data.weight.weekAgo).toFixed(1)
                        : "-"
                    } kg`
                  : "-"}
              </p>
              <p className="text-sm text-gray-400">vs settimana fa</p>
            </div>
          </div>

          {weightData && weightData.data.length > 0 && (
            <div className="mt-4 h-20 flex items-end gap-1">
              {weightData.data.slice(-14).map((d, i) => {
                const min = weightData.stats.min;
                const max = weightData.stats.max;
                const range = max - min || 1;
                const height = ((d.weight - min) / range) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-blue-600 rounded-t"
                    style={{ height: `${Math.max(10, height)}%` }}
                    title={`${d.date}: ${d.weight}kg`}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="card mb-6">
          <h3 className="text-sm text-gray-400 mb-3">Streak</h3>
          <div className="flex justify-between">
            <div>
              <p className="text-2xl font-bold text-green-400">
                {data.currentStreak}
              </p>
              <p className="text-sm text-gray-400">Attuale</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{data.bestStreak}</p>
              <p className="text-sm text-gray-400">Record</p>
            </div>
          </div>
        </div>

        {data.mostSkipped && (
          <div className="card bg-yellow-900/30 border border-yellow-600/30">
            <p className="text-sm text-yellow-400">
              Attivita piu saltata: <strong>{getActivityById(data.mostSkipped)?.name}</strong>
            </p>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
