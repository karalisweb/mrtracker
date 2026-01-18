"use client";

import { useRef, useCallback } from "react";
import { cn, formatTime, triggerHaptic } from "@/lib/utils";
import { Activity } from "@/lib/activities";
import { ActivityData, ActivityState } from "@/types";
import { Icon } from "./Icons";

interface ActivityButtonProps {
  activity: Activity;
  data: ActivityData;
  onTap: () => void;
  onReset?: () => void;
}

const stateStyles: Record<ActivityState, string> = {
  pending: "bg-gray-800 text-gray-400 border-gray-700",
  active: "bg-blue-600 text-white border-blue-500 animate-pulse-slow",
  completed: "bg-green-600 text-white border-green-500",
  skipped: "bg-yellow-500 text-gray-900 border-yellow-400",
};

const LONG_PRESS_DURATION = 600; // ms

export function ActivityButton({
  activity,
  data,
  onTap,
  onReset,
}: ActivityButtonProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const canReset = data.state === "completed" || data.state === "skipped";

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePressStart = useCallback(() => {
    isLongPressRef.current = false;

    if (canReset && onReset) {
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        triggerHaptic();
        onReset();
      }, LONG_PRESS_DURATION);
    }
  }, [canReset, onReset]);

  const handlePressEnd = useCallback(() => {
    clearTimer();

    // Solo se non è stata una long press, esegui il tap normale
    if (!isLongPressRef.current) {
      triggerHaptic();
      onTap();
    }
    isLongPressRef.current = false;
  }, [clearTimer, onTap]);

  const handlePressCancel = useCallback(() => {
    clearTimer();
    isLongPressRef.current = false;
  }, [clearTimer]);

  const renderContent = () => {
    switch (data.state) {
      case "active":
        return (
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">
              {formatTime(data.startTime!)}
            </span>
            <span className="text-xs mt-1 opacity-80">TAP PER STOP</span>
          </div>
        );

      case "completed":
        if (activity.type === "time_only" && data.startTime) {
          return (
            <span className="text-lg font-semibold">
              {formatTime(data.startTime)}
            </span>
          );
        }
        if (activity.type === "value" && data.value !== null) {
          return (
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold">{data.value} kg</span>
              {data.notes && (
                <span className="text-xs opacity-80">{data.notes}</span>
              )}
            </div>
          );
        }
        if (data.startTime && data.endTime) {
          // Prova a parsare le note come dati allenamento (JSON)
          let workoutInfo = null;
          if (activity.id === "workout" && data.notes) {
            try {
              const parsed = JSON.parse(data.notes);
              if (parsed.bpm || parsed.calories) {
                workoutInfo = parsed;
              }
            } catch {
              // Non è JSON, usa come nota normale
            }
          }

          return (
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold">
                {formatTime(data.startTime)} - {formatTime(data.endTime)}
              </span>
              {workoutInfo ? (
                <div className="text-xs opacity-80 flex gap-2">
                  {workoutInfo.bpm && <span>{workoutInfo.bpm} bpm</span>}
                  {workoutInfo.calories && <span>{workoutInfo.calories} kcal</span>}
                </div>
              ) : data.notes && (
                <span className="text-xs opacity-80 truncate max-w-full px-2">{data.notes}</span>
              )}
            </div>
          );
        }
        return <Icon name="check" size={24} />;

      case "skipped":
        return <span className="text-sm font-medium">Saltata</span>;

      default:
        return <span className="text-2xl opacity-60">-</span>;
    }
  };

  return (
    <button
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressCancel}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressCancel}
      className={cn(
        "flex flex-col items-center justify-center",
        "w-full aspect-square rounded-2xl",
        "border-2 transition-all duration-200",
        "active:scale-95 select-none",
        stateStyles[data.state]
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon name={activity.icon} size={20} />
        <span className="text-sm font-medium">{activity.name}</span>
      </div>
      {renderContent()}
      {canReset && (
        <span className="text-xs mt-1 opacity-60">Tieni premuto per annullare</span>
      )}
    </button>
  );
}
