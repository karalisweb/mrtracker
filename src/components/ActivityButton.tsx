"use client";

import { cn, formatTime, triggerHaptic } from "@/lib/utils";
import { Activity } from "@/lib/activities";
import { ActivityData, ActivityState } from "@/types";
import { Icon } from "./Icons";

interface ActivityButtonProps {
  activity: Activity;
  data: ActivityData;
  onTap: () => void;
  onLongPress?: () => void;
}

const stateStyles: Record<ActivityState, string> = {
  pending: "bg-gray-800 text-gray-400 border-gray-700",
  active: "bg-blue-600 text-white border-blue-500 animate-pulse-slow",
  completed: "bg-green-600 text-white border-green-500",
  skipped: "bg-yellow-500 text-gray-900 border-yellow-400",
};

export function ActivityButton({
  activity,
  data,
  onTap,
  onLongPress,
}: ActivityButtonProps) {
  const handleClick = () => {
    triggerHaptic();
    onTap();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLongPress) {
      triggerHaptic();
      onLongPress();
    }
  };

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
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "flex flex-col items-center justify-center",
        "w-full aspect-square rounded-2xl",
        "border-2 transition-all duration-200",
        "active:scale-95",
        stateStyles[data.state]
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon name={activity.icon} size={20} />
        <span className="text-sm font-medium">{activity.name}</span>
      </div>
      {renderContent()}
    </button>
  );
}
