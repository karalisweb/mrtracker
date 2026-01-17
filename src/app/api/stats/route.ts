import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACTIVITIES } from "@/lib/activities";
import { StatsData } from "@/types";
import { subDays, subMonths, startOfDay } from "date-fns";

export const dynamic = "force-dynamic";

function calculateAverageTime(times: Date[]): string | null {
  if (times.length === 0) return null;

  const totalMinutes = times.reduce((sum, time) => {
    return sum + time.getHours() * 60 + time.getMinutes();
  }, 0);

  const avgMinutes = Math.round(totalMinutes / times.length);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function calculateStreak(logs: { date: Date; completed: boolean }[]): { current: number; best: number } {
  let current = 0;
  let best = 0;
  let tempStreak = 0;

  const sortedLogs = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());

  for (let i = 0; i < sortedLogs.length; i++) {
    if (sortedLogs[i].completed) {
      tempStreak++;
      if (i === 0 || sortedLogs[i - 1].completed) {
        if (i === 0) current = tempStreak;
      }
    } else {
      best = Math.max(best, tempStreak);
      tempStreak = 0;
      if (i === 0) current = 0;
    }
  }
  best = Math.max(best, tempStreak);

  return { current, best };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    const today = startOfDay(new Date());
    let startDate: Date;

    switch (period) {
      case "month":
        startDate = subMonths(today, 1);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate = subDays(today, 7);
    }

    const logs = await prisma.dailyLog.findMany({
      where: {
        date: { gte: startDate },
      },
      orderBy: { date: "desc" },
    });

    const completedLogs = logs.filter((log) => log.completed);
    const completionRate = logs.length > 0
      ? Math.round((completedLogs.length / logs.length) * 100)
      : 0;

    const wakeTimes = logs
      .filter((log) => log.wakeUpTime)
      .map((log) => log.wakeUpTime!);
    const avgWakeUpTime = calculateAverageTime(wakeTimes);

    const durations = logs
      .filter((log) => log.totalDuration)
      .map((log) => log.totalDuration!);
    const avgRoutineDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    const gapTimes = logs
      .filter((log) => log.totalGapTime)
      .map((log) => log.totalGapTime!);
    const avgGapTime = gapTimes.length > 0
      ? Math.round(gapTimes.reduce((a, b) => a + b, 0) / gapTimes.length)
      : null;

    const streakData = logs.map((log) => ({
      date: log.date,
      completed: log.completed,
    }));
    const { current: currentStreak, best: bestStreak } = calculateStreak(streakData);

    const currentWeight = logs.find((log) => log.weight)?.weight || null;
    const weekAgoLog = logs.find((log) => {
      const logDate = new Date(log.date);
      return logDate <= subDays(today, 7) && log.weight;
    });
    const monthAgoLog = logs.find((log) => {
      const logDate = new Date(log.date);
      return logDate <= subDays(today, 30) && log.weight;
    });

    let weightTrend: "up" | "down" | "stable" = "stable";
    if (currentWeight && weekAgoLog?.weight) {
      const diff = currentWeight - weekAgoLog.weight;
      if (diff > 0.3) weightTrend = "up";
      else if (diff < -0.3) weightTrend = "down";
    }

    const activitiesCompletion: Record<string, { completionRate: number; avgDuration: number | null }> = {};

    for (const activity of ACTIVITIES) {
      let completed = 0;
      const durations: number[] = [];

      for (const log of logs) {
        const logData = log as Record<string, unknown>;

        if (activity.type === "time_only" && activity.dbValueField) {
          if (logData[activity.dbValueField]) completed++;
        } else if (activity.type === "value" && activity.dbValueField) {
          if (logData[activity.dbValueField] !== null) completed++;
        } else if (activity.dbStartField && activity.dbEndField) {
          const start = logData[activity.dbStartField] as Date | null;
          const end = logData[activity.dbEndField] as Date | null;
          if (start && end) {
            completed++;
            const duration = Math.round(
              (new Date(end).getTime() - new Date(start).getTime()) / 60000
            );
            durations.push(duration);
          } else if (activity.id === "walk" && logData.walkSkipped) {
            completed++;
          }
        }
      }

      activitiesCompletion[activity.id] = {
        completionRate: logs.length > 0 ? Math.round((completed / logs.length) * 100) : 0,
        avgDuration: durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : null,
      };
    }

    let mostSkipped: string | null = null;
    let lowestCompletion = 100;
    for (const [activityId, data] of Object.entries(activitiesCompletion)) {
      const activity = ACTIVITIES.find((a) => a.id === activityId);
      if (activity && !activity.optional && data.completionRate < lowestCompletion) {
        lowestCompletion = data.completionRate;
        mostSkipped = activityId;
      }
    }

    const response: StatsData = {
      period,
      completionRate,
      avgWakeUpTime,
      avgRoutineDuration,
      avgGapTime,
      currentStreak,
      bestStreak,
      weight: {
        current: currentWeight,
        weekAgo: weekAgoLog?.weight || null,
        monthAgo: monthAgoLog?.weight || null,
        trend: weightTrend,
      },
      activitiesCompletion,
      mostSkipped,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
