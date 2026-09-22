import { startOfDay } from "date-fns";
import { NextResponse } from "next/server";

import { generateICS, type IcsEvent } from "@/lib/ics";
import { prisma } from "@/lib/db";

export async function GET() {
  const today = startOfDay(new Date());

  const applications = await prisma.application.findMany({
    where: {
      OR: [
        { nextInterviewDate: { gte: today } },
        { followUpDate: { gte: today } },
      ],
    },
    include: { company: true },
  });

  const events: IcsEvent[] = applications.flatMap((app) => {
    const items: IcsEvent[] = [];
    if (app.nextInterviewDate && app.nextInterviewDate >= today) {
      items.push({
        uid: `interview-${app.id}@internship-tracker`,
        date: app.nextInterviewDate,
        summary: `Interview: ${app.company.name} — ${app.roleTitle}`,
      });
    }
    if (app.followUpDate && app.followUpDate >= today) {
      items.push({
        uid: `followup-${app.id}@internship-tracker`,
        date: app.followUpDate,
        summary: `Follow up: ${app.company.name} — ${app.roleTitle}`,
      });
    }
    return items;
  });

  const ics = generateICS(events);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="internship-tracker.ics"`,
    },
  });
}
