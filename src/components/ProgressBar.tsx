"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  onTrack: boolean;
}

export function ProgressBar({ percentage, onTrack }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">Progresso</span>
        <span className={cn(
          "font-medium",
          onTrack ? "text-green-400" : "text-yellow-400"
        )}>
          {percentage}%
        </span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            onTrack ? "bg-green-500" : "bg-yellow-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
