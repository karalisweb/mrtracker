import nodemailer from "nodemailer";
import { WeeklyReportData } from "@/types";
import { getActivityById } from "@/lib/activities";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatDateRange(start: Date, end: Date): string {
  return `${format(start, "d MMM", { locale: it })} - ${format(end, "d MMM yyyy", { locale: it })}`;
}

function formatDay(dateStr: string): string {
  return format(new Date(dateStr), "EEE d", { locale: it });
}

function getActivityName(activityId: string): string {
  const activity = getActivityById(activityId);
  return activity?.name || activityId;
}

export function generateReportHTML(report: WeeklyReportData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 24px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      opacity: 0.8;
      font-size: 14px;
    }
    .content {
      background: white;
      padding: 24px;
      border-radius: 0 0 12px 12px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
      margin: 24px 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e9ecef;
    }
    .weight-box {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .weight-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .weight-delta {
      font-weight: bold;
      padding: 4px 12px;
      border-radius: 20px;
    }
    .delta-down {
      background: #d4edda;
      color: #155724;
    }
    .delta-up {
      background: #f8d7da;
      color: #721c24;
    }
    .delta-stable {
      background: #e9ecef;
      color: #495057;
    }
    .day-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .day-row:last-child {
      border-bottom: none;
    }
    .day-name {
      font-weight: 500;
      width: 60px;
    }
    .day-status {
      font-size: 14px;
    }
    .status-completed {
      color: #28a745;
    }
    .status-incomplete {
      color: #dc3545;
    }
    .day-time {
      font-size: 14px;
      color: #666;
      width: 50px;
      text-align: right;
    }
    .footer {
      text-align: center;
      padding: 16px;
      color: #666;
      font-size: 12px;
    }
    .alert {
      background: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Report Settimanale MR</h1>
      <p>${formatDateRange(report.weekStart, report.weekEnd)}</p>
    </div>

    <div class="content">
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">${report.completionRate}%</div>
          <div class="stat-label">Completamento</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.daysCompleted}/7</div>
          <div class="stat-label">Giorni Completi</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.avgWakeUpTime || "-"}</div>
          <div class="stat-label">Sveglia Media</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.avgDuration || "-"}m</div>
          <div class="stat-label">Durata Media</div>
        </div>
      </div>

      <div class="section-title">Peso</div>
      <div class="weight-box">
        <div class="weight-row">
          <span>Inizio: <strong>${report.weightStart?.toFixed(1) || "-"} kg</strong></span>
          <span>Fine: <strong>${report.weightEnd?.toFixed(1) || "-"} kg</strong></span>
          <span class="weight-delta ${
            report.weightDelta === null
              ? "delta-stable"
              : report.weightDelta < 0
                ? "delta-down"
                : report.weightDelta > 0
                  ? "delta-up"
                  : "delta-stable"
          }">
            ${
              report.weightDelta !== null
                ? `${report.weightDelta > 0 ? "+" : ""}${report.weightDelta.toFixed(1)} kg`
                : "="
            }
          </span>
        </div>
      </div>

      <div class="section-title">Dettaglio Giornaliero</div>
      ${report.dailyDetails
        .map(
          (day) => `
        <div class="day-row">
          <span class="day-name">${formatDay(day.date)}</span>
          <span class="day-status ${day.completed ? "status-completed" : "status-incomplete"}">
            ${day.completed ? "Completato" : `${day.completedActivities}/${day.totalActivities}`}
          </span>
          <span class="day-time">${day.routineEndTime || "-"}</span>
        </div>
      `
        )
        .join("")}

      ${
        report.mostSkipped
          ? `
        <div class="alert">
          Attivita piu saltata: <strong>${getActivityName(report.mostSkipped)}</strong>
        </div>
      `
          : ""
      }
    </div>

    <div class="footer">
      MR Tracker - Morning Routine
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendWeeklyReport(
  report: WeeklyReportData,
  toEmail: string
): Promise<boolean> {
  try {
    const html = generateReportHTML(report);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "MR Tracker <noreply@localhost>",
      to: toEmail,
      subject: `Report Settimanale MR - ${format(report.weekStart, "d MMM", { locale: it })}`,
      html,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
