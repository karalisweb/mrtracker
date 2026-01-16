import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeeklyReport } from "@/lib/analytics";
import { sendWeeklyReport } from "@/lib/email";
import { startOfWeek, subWeeks } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

    const report = await generateWeeklyReport(lastWeekStart);

    const reportEmail = process.env.REPORT_EMAIL || "alessio@karalisweb.net";

    const sent = await sendWeeklyReport(report, reportEmail);

    const savedReport = await prisma.weeklyReport.create({
      data: {
        weekStart: report.weekStart,
        weekEnd: report.weekEnd,
        daysCompleted: report.daysCompleted,
        daysTotal: report.daysTotal,
        avgWakeUpTime: report.avgWakeUpTime,
        avgDuration: report.avgDuration,
        avgGapTime: report.avgGapTime,
        weightStart: report.weightStart,
        weightEnd: report.weightEnd,
        weightDelta: report.weightDelta,
        mostSkipped: report.mostSkipped,
        sentAt: sent ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      reportId: savedReport.id,
      sentTo: reportEmail,
      emailSent: sent,
    });
  } catch (error) {
    console.error("Error generating weekly report:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly report" },
      { status: 500 }
    );
  }
}
