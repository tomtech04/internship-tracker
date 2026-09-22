import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const [contacts, applications, events] = await Promise.all([
    prisma.contact.findMany(),
    prisma.application.findMany(),
    prisma.event.findMany(),
  ]);

  const backup = {
    version: 1 as const,
    exportedAt: new Date().toISOString(),
    contacts,
    applications,
    events,
  };

  const filename = `internship-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
