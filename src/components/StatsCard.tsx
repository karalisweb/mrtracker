"use client";

import { cn } from "@/lib/utils";
import { Icon } from "./Icons";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div className={cn("card", className)}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        {icon && <Icon name={icon} size={20} className="text-gray-500" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {trend && (
          <span className={cn(
            "text-sm",
            trend === "down" ? "text-green-400" :
            trend === "up" ? "text-red-400" : "text-gray-400"
          )}>
            {trend === "down" ? "v" : trend === "up" ? "^" : "="}
          </span>
        )}
      </div>
    </div>
  );
}
