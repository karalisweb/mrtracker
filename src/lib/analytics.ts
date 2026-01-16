import { prisma } from "@/lib/prisma";
import { ACTIVITIES, getRequiredActivities } from "@/lib/activities";
import { WeeklyReportData, DayDetail } from "@/types";
import { DailyLog } from "@prisma/client";
import {
  endOfWeek,
  format,
  differenceInMinutes,
} from "date-fns";

export function calculateGapTime(log: DailyLog): number {
  const activities = getActivitiesWithDuration();
  let totalGap = 0;
  let prevEnd: Date | null = null;

  for (const activity of activities) {
    const logData = log as Record<string, unknown>;
    const start = logData[activity.dbStartField!] as Date | null;
    const end = logData[activity.dbEndField!] as Date | null;

    if (start && prevEnd) {
      const gap = differenceInMinutes(new Date(start), new Date(prevEnd));
      if (gap > 0) {
        totalGap += gap;
      }
    }

    if (end) {
      prevEnd = new Date(end);
    }
  }

  return totalGap;
}

function getActivitiesWithDuration() {
  return ACTIVITIES.filter(
    (a) => a.type === "duration" || a.type === "duration_optional"
  ).sort((a, b) => a.order - b.order);
}

function calculateAverageTime(times: Date[]): string | null {
  if (times.length === 0) return null;

  const totalMinutes = times.reduce((sum, time) => {
    const d = new Date(time);
    return sum + d.getHours() * 60 + d.getMinutes();
  }, 0);

  const avgMinutes = Math.round(totalMinutes / times.length);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function calculateAverage(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
}

function countSkippedActivities(logs: DailyLog[]): Record<string, number> {
  const skippedCount: Record<string, number> = {};

  for (const activity of getRequiredActivities()) {
    skippedCount[activity.id] = 0;

    for (const log of logs) {
      const logData = log as Record<string, unknown>;

      if (activity.type === "time_only" && activity.dbValueField) {
        if (!logData[activity.dbValueField]) {
          skippedCount[activity.id]++;
        }
      } else if (activity.type === "value" && activity.dbValueField) {
        if (logData[activity.dbValueField] === null) {
          skippedCount[activity.id]++;
        }
      } else if (activity.dbStartField && activity.dbEndField) {
        const start = logData[activity.dbStartField];
        const end = logData[activity.dbEndField];
        if (!start || !end) {
          skippedCount[activity.id]++;
        }
      }
    }
  }

  return skippedCount;
}

function getMostSkipped(skippedCount: Record<string, number>): string | null {
  let mostSkipped: string | null = null;
  let maxSkipped = 0;

  for (const [activityId, count] of Object.entries(skippedCount)) {
    if (count > maxSkipped) {
      maxSkipped = count;
      mostSkipped = activityId;
    }
  }

  return mostSkipped;
}

function formatDayDetail(log: DailyLog): DayDetail {
  const requiredActivities = getRequiredActivities();
  let completedActivities = 0;

  for (const activity of requiredActivities) {
    const logData = log as Record<string, unknown>;

    if (activity.type === "time_only" && activity.dbValueField) {
      if (logData[activity.dbValueField]) completedActivities++;
    } else if (activity.type === "value" && activity.dbValueField) {
      if (logData[activity.dbValueField] !== null) completedActivities++;
    } else if (activity.dbStartField && activity.dbEndField) {
      if (logData[activity.dbStartField] && logData[activity.dbEndField]) {
        completedActivities++;
      }
    }
  }

  const walkLog = log as Record<string, unknown>;
  if (
    (walkLog.walkStart && walkLog.walkEnd) ||
    walkLog.walkSkipped
  ) {
    completedActivities++;
  }

  const totalActivities = requiredActivities.length + 1;

  return {
    date: format(log.date, "yyyy-MM-dd"),
    completed: log.completed,
    completedActivities,
    totalActivities,
    routineEndTime: log.routineEndTime
      ? format(new Date(log.routineEndTime), "HH:mm")
      : null,
  };
}

export async function generateWeeklyReport(weekStart: Date): Promise<WeeklyReportData> {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const logs = await prisma.dailyLog.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    orderBy: { date: "asc" },
  });

  const completedDays = logs.filter((l) => l.completed).length;

  const wakeTimes = logs
    .filter((l) => l.wakeUpTime)
    .map((l) => l.wakeUpTime!);
  const avgWakeUp = calculateAverageTime(wakeTimes);

  const durations = logs
    .filter((l) => l.totalDuration)
    .map((l) => l.totalDuration!);
  const avgDuration = calculateAverage(durations);

  const gapTimes = logs
    .filter((l) => l.totalGapTime)
    .map((l) => l.totalGapTime!);
  const avgGap = calculateAverage(gapTimes);

  const weights = logs.filter((l) => l.weight).map((l) => l.weight!);
  const weightStart = weights.length > 0 ? weights[0] : null;
  const weightEnd = weights.length > 0 ? weights[weights.length - 1] : null;

  const skippedCount = countSkippedActivities(logs);
  const mostSkipped = getMostSkipped(skippedCount);

  return {
    weekStart,
    weekEnd,
    daysCompleted: completedDays,
    daysTotal: 7,
    completionRate: Math.round((completedDays / 7) * 100),
    avgWakeUpTime: avgWakeUp,
    avgDuration,
    avgGapTime: avgGap,
    weightStart,
    weightEnd,
    weightDelta: weightEnd && weightStart ? weightEnd - weightStart : null,
    mostSkipped,
    dailyDetails: logs.map(formatDayDetail),
  };
}

export function calculateStreaks(logs: DailyLog[]): { current: number; best: number } {
  let current = 0;
  let best = 0;
  let tempStreak = 0;

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (let i = 0; i < sortedLogs.length; i++) {
    if (sortedLogs[i].completed) {
      tempStreak++;
      if (i === 0) current = tempStreak;
    } else {
      best = Math.max(best, tempStreak);
      tempStreak = 0;
      if (i === 0) current = 0;
    }
  }
  best = Math.max(best, tempStreak);

  return { current, best };
}
