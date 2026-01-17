import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACTIVITIES, getRequiredActivities } from "@/lib/activities";
import { ActivityData, DailyLogData, DailyLogSummary } from "@/types";
import { startOfDay } from "date-fns";

export const dynamic = "force-dynamic";

function getActivityState(log: Record<string, unknown>, activity: typeof ACTIVITIES[0]): ActivityData {
  const { id, type, dbStartField, dbEndField, dbValueField } = activity;

  if (type === "time_only") {
    const value = log[dbValueField!] as Date | null;
    return {
      id,
      state: value ? "completed" : "pending",
      value: value ? new Date(value).getTime() : null,
      startTime: value ? (value as Date).toISOString() : null,
    };
  }

  if (type === "value") {
    const value = log[dbValueField!] as number | null;
    const delta = log["weightDelta"] as number | null;
    return {
      id,
      state: value !== null ? "completed" : "pending",
      value,
      notes: delta !== null ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}` : null,
    };
  }

  if (type === "duration" || type === "duration_optional") {
    const start = log[dbStartField!] as Date | null;
    const end = log[dbEndField!] as Date | null;
    const skipped = id === "walk" ? (log["walkSkipped"] as boolean) : false;

    if (skipped) {
      return { id, state: "skipped" };
    }

    if (start && end) {
      const duration = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
      return {
        id,
        state: "completed",
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        duration,
        notes: activity.dbNotesField ? (log[activity.dbNotesField] as string | null) : null,
      };
    }

    if (start && !end) {
      return {
        id,
        state: "active",
        startTime: new Date(start).toISOString(),
      };
    }

    return { id, state: "pending" };
  }

  return { id, state: "pending" };
}

function calculateSummary(activities: Record<string, ActivityData>): DailyLogSummary {
  const requiredActivities = getRequiredActivities();
  let completedCount = 0;
  let totalDuration = 0;
  let lastEndTime: Date | null = null;

  for (const activity of requiredActivities) {
    const data = activities[activity.id];
    if (data.state === "completed") {
      completedCount++;
      if (data.duration) {
        totalDuration += data.duration;
      }
      if (data.endTime) {
        const endTime = new Date(data.endTime);
        if (!lastEndTime || endTime > lastEndTime) {
          lastEndTime = endTime;
        }
      }
    }
  }

  const walkActivity = activities["walk"];
  if (walkActivity?.state === "completed" || walkActivity?.state === "skipped") {
    completedCount++;
    if (walkActivity.duration) {
      totalDuration += walkActivity.duration;
    }
  }

  const totalCount = requiredActivities.length + 1;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const targetTime = new Date();
  targetTime.setHours(7, 0, 0, 0);
  const onTrack = !lastEndTime || lastEndTime <= targetTime;

  return {
    completedCount,
    totalCount,
    percentage,
    totalDuration: totalDuration || null,
    totalGapTime: null,
    routineEndTime: lastEndTime?.toISOString() || null,
    onTrack,
  };
}

export async function GET() {
  try {
    const today = startOfDay(new Date());

    let log = await prisma.dailyLog.findUnique({
      where: { date: today },
    });

    if (!log) {
      log = await prisma.dailyLog.create({
        data: { date: today },
      });
    }

    const activities: Record<string, ActivityData> = {};
    for (const activity of ACTIVITIES) {
      activities[activity.id] = getActivityState(log as Record<string, unknown>, activity);
    }

    const summary = calculateSummary(activities);

    const response: DailyLogData = {
      id: log.id,
      date: log.date.toISOString(),
      activities,
      summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching daily log:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily log" },
      { status: 500 }
    );
  }
}
