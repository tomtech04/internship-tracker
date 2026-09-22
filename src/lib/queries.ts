import { prisma } from "@/lib/db";

export function getAllApplications() {
  return prisma.application.findMany({
    include: { referral: true, events: true },
    orderBy: { updatedAt: "desc" },
  });
}

export type ApplicationWithRelations = Awaited<
  ReturnType<typeof getAllApplications>
>[number];

export function getApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      referral: true,
      events: { orderBy: { date: "desc" } },
    },
  });
}

export function getAllContacts() {
  return prisma.contact.findMany({
    include: { applications: true },
    orderBy: { name: "asc" },
  });
}

export type ContactWithApplications = Awaited<
  ReturnType<typeof getAllContacts>
>[number];

export function getContactById(id: string) {
  return prisma.contact.findUnique({
    where: { id },
    include: { applications: true },
  });
}

export function getAllContactsBasic() {
  return prisma.contact.findMany({
    select: { id: true, name: true, company: true },
    orderBy: { name: "asc" },
  });
}
