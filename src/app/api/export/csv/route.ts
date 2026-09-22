import { NextResponse } from "next/server";

import { applicationsToCSV, type ApplicationCsvRow } from "@/lib/csv";
import { prisma } from "@/lib/db";

export async function GET() {
  const applications = await prisma.application.findMany({
    include: { company: true, referral: true },
    orderBy: { company: { name: "asc" } },
  });

  const rows: ApplicationCsvRow[] = applications.map((app) => ({
    companyName: app.company.name,
    roleTitle: app.roleTitle,
    team: app.team,
    location: app.location,
    jobUrl: app.jobUrl,
    reqId: app.reqId,
    source: app.source,
    resumeVersion: app.resumeVersion,
    tier: app.tier,
    status: app.status,
    dateApplied: app.dateApplied,
    deadline: app.deadline,
    followUpDate: app.followUpDate,
    nextInterviewDate: app.nextInterviewDate,
    itarRestricted: app.itarRestricted,
    compensation: app.compensation,
    notes: app.notes,
    referralName: app.referral?.name ?? null,
  }));

  const csv = applicationsToCSV(rows);
  const filename = `applications-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
