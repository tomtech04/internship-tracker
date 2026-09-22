-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "team" TEXT,
    "location" TEXT,
    "jobUrl" TEXT,
    "reqId" TEXT,
    "source" TEXT NOT NULL,
    "resumeVersion" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Wishlist',
    "dateApplied" DATETIME,
    "deadline" DATETIME,
    "followUpDate" DATETIME,
    "nextInterviewDate" DATETIME,
    "referralId" TEXT,
    "itarRestricted" BOOLEAN NOT NULL DEFAULT false,
    "compensation" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "relationship" TEXT NOT NULL,
    "howWeMet" TEXT,
    "email" TEXT,
    "linkedinUrl" TEXT,
    "lastContactedDate" DATETIME,
    "nextStep" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_referralId_idx" ON "Application"("referralId");

-- CreateIndex
CREATE INDEX "Event_applicationId_idx" ON "Event"("applicationId");
