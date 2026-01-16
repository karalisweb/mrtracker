import { DailyLog } from "@prisma/client";

export type ActivityState = "pending" | "active" | "completed" | "skipped";

export interface ActivityData {
  id: string;
  state: ActivityState;
  startTime?: string | null;
  endTime?: string | null;
  duration?: number | null;
  value?: number | null;
  notes?: string | null;
  sleepQuality?: number | null;
}

export interface DailyLogData {
  id: string;
  date: string;
  activities: Record<string, ActivityData>;
  summary: DailyLogSummary;
}

export interface DailyLogSummary {
  completedCount: number;
  totalCount: number;
  percentage: number;
  totalDuration: number | null;
  totalGapTime: number | null;
  routineEndTime: string | null;
  onTrack: boolean;
}

export interface ActivityAction {
  activityId: string;
  action: "start" | "stop" | "set_value" | "set_time" | "skip" | "reset";
  value?: number;
  sleepQuality?: number;
  notes?: string;
  time?: string;
}

export interface StatsData {
  period: string;
  completionRate: number;
  avgWakeUpTime: string | null;
  avgRoutineDuration: number | null;
  avgGapTime: number | null;
  currentStreak: number;
  bestStreak: number;
  weight: {
    current: number | null;
    weekAgo: number | null;
    monthAgo: number | null;
    trend: "up" | "down" | "stable";
  };
  activitiesCompletion: Record<string, {
    completionRate: number;
    avgDuration: number | null;
  }>;
  mostSkipped: string | null;
}

export interface WeightHistoryData {
  data: Array<{
    date: string;
    weight: number;
    delta: number | null;
  }>;
  stats: {
    min: number;
    max: number;
    avg: number;
    trend: number;
  };
}

export interface WeeklyReportData {
  weekStart: Date;
  weekEnd: Date;
  daysCompleted: number;
  daysTotal: number;
  completionRate: number;
  avgWakeUpTime: string | null;
  avgDuration: number | null;
  avgGapTime: number | null;
  weightStart: number | null;
  weightEnd: number | null;
  weightDelta: number | null;
  mostSkipped: string | null;
  dailyDetails: DayDetail[];
}

export interface DayDetail {
  date: string;
  completed: boolean;
  completedActivities: number;
  totalActivities: number;
  routineEndTime: string | null;
}

export type { DailyLog };
