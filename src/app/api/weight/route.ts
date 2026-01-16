import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WeightHistoryData } from "@/types";
import { subDays, startOfDay, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const today = startOfDay(new Date());
    const startDate = subDays(today, days);

    const logs = await prisma.dailyLog.findMany({
      where: {
        date: { gte: startDate },
        weight: { not: null },
      },
      orderBy: { date: "asc" },
      select: {
        date: true,
        weight: true,
        weightDelta: true,
      },
    });

    const weights = logs.map((log) => log.weight!);
    const min = weights.length > 0 ? Math.min(...weights) : 0;
    const max = weights.length > 0 ? Math.max(...weights) : 0;
    const avg = weights.length > 0
      ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10
      : 0;

    let trend = 0;
    if (logs.length >= 2) {
      const firstWeight = logs[0].weight!;
      const lastWeight = logs[logs.length - 1].weight!;
      const daysDiff = Math.max(1, logs.length);
      trend = Math.round(((lastWeight - firstWeight) / daysDiff) * 7 * 10) / 10;
    }

    const response: WeightHistoryData = {
      data: logs.map((log) => ({
        date: format(log.date, "yyyy-MM-dd"),
        weight: log.weight!,
        delta: log.weightDelta,
      })),
      stats: {
        min,
        max,
        avg,
        trend,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching weight history:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight history" },
      { status: 500 }
    );
  }
}
