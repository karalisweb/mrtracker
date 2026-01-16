import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActivityById } from "@/lib/activities";
import { ActivityAction } from "@/types";
import { startOfDay } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body: ActivityAction = await request.json();
    const { activityId, action, value, sleepQuality, notes, time } = body;

    const activity = getActivityById(activityId);
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    const today = startOfDay(new Date());

    let log = await prisma.dailyLog.findUnique({
      where: { date: today },
    });

    if (!log) {
      log = await prisma.dailyLog.create({
        data: { date: today },
      });
    }

    const updateData: Record<string, unknown> = {};
    const now = new Date();

    switch (action) {
      case "start":
        if (activity.dbStartField) {
          updateData[activity.dbStartField] = now;
          updateData[activity.dbEndField!] = null;
        }
        break;

      case "stop":
        if (activity.dbEndField) {
          updateData[activity.dbEndField] = now;
          if (notes && activity.dbNotesField) {
            updateData[activity.dbNotesField] = notes;
          }
        }
        break;

      case "set_value":
        if (activity.id === "weight" && value !== undefined) {
          updateData.weight = value;

          const previousLog = await prisma.dailyLog.findFirst({
            where: {
              date: { lt: today },
              weight: { not: null },
            },
            orderBy: { date: "desc" },
          });

          if (previousLog?.weight) {
            updateData.weightDelta = Math.round((value - previousLog.weight) * 10) / 10;
          }
        }
        break;

      case "set_time":
        if (activity.id === "wake_up") {
          const wakeUpTime = time ? new Date(time) : now;
          updateData.wakeUpTime = wakeUpTime;
          if (sleepQuality !== undefined) {
            updateData.sleepQuality = sleepQuality;
          }
        } else if (activity.type === "time_only" && activity.dbValueField) {
          updateData[activity.dbValueField] = time ? new Date(time) : now;
        }
        break;

      case "skip":
        if (activity.id === "walk") {
          updateData.walkSkipped = true;
          updateData.walkStart = null;
          updateData.walkEnd = null;
        }
        break;

      case "reset":
        if (activity.dbStartField) {
          updateData[activity.dbStartField] = null;
        }
        if (activity.dbEndField) {
          updateData[activity.dbEndField] = null;
        }
        if (activity.dbValueField) {
          updateData[activity.dbValueField] = null;
        }
        if (activity.id === "weight") {
          updateData.weightDelta = null;
        }
        if (activity.id === "wake_up") {
          updateData.sleepQuality = null;
        }
        if (activity.id === "walk") {
          updateData.walkSkipped = false;
        }
        break;
    }

    await prisma.dailyLog.update({
      where: { id: log.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      activityId,
      action,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}
