"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { updateApplicationStatus } from "@/actions/applications";
import { TierBadge } from "@/components/common/badges";
import { EmptyState } from "@/components/common/empty-state";
import { fieldClass } from "@/components/common/form-fields";
import {
  RESUME_VERSIONS,
  SOURCES,
  STATUSES,
  TIERS,
  type Status,
} from "@/lib/constants";
import { formatDateInput } from "@/lib/dates";

export type TableApplication = {
  id: string;
  company: string;
  roleTitle: string;
  team: string | null;
  location: string | null;
  notes: string | null;
  status: Status;
  tier: string;
  resumeVersion: string;
  source: string;
  dateApplied: Date | null;
  deadline: Date | null;
  followUpDate: Date | null;
  nextInterviewDate: Date | null;
  applicationEmail: string | null;
  referralName: string | null;
};

type SortKey =
  | "company"
  | "roleTitle"
  | "status"
  | "tier"
  | "dateApplied"
  | "deadline"
  | "followUpDate"
  | "nextInterviewDate";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "roleTitle", label: "Role" },
  { key: "status", label: "Status" },
  { key: "tier", label: "Tier" },
  { key: "dateApplied", label: "Applied" },
  { key: "deadline", label: "Deadline" },
  { key: "followUpDate", label: "Follow-up" },
  { key: "nextInterviewDate", label: "Interview" },
];

function compareValues(a: TableApplication, b: TableApplication, key: SortKey) {
  const av = a[key];
  const bv = b[key];
  if (av == null && bv == null) return 0;
  if (av == null) return -1;
  if (bv == null) return 1;
  if (av instanceof Date && bv instanceof Date) {
    return av.getTime() - bv.getTime();
  }
  return String(av).localeCompare(String(bv));
}

export function ApplicationsTable({
  applications,
}: {
  applications: TableApplication[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [resumeFilter, setResumeFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("company");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications
      .filter((a) => (statusFilter ? a.status === statusFilter : true))
      .filter((a) => (tierFilter ? a.tier === tierFilter : true))
      .filter((a) => (resumeFilter ? a.resumeVersion === resumeFilter : true))
      .filter((a) => (sourceFilter ? a.source === sourceFilter : true))
      .filter((a) => {
        if (!q) return true;
        return [
          a.company,
          a.roleTitle,
          a.team,
          a.location,
          a.notes,
          a.applicationEmail,
        ]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        const cmp = compareValues(a, b, sortKey);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [applications, search, statusFilter, tierFilter, resumeFilter, sourceFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleStatusChange(id: string, status: Status) {
    setPendingId(id);
    startTransition(async () => {
      await updateApplicationStatus(id, status);
      router.refresh();
      setPendingId(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search company, role, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applications"
            className={`${fieldClass} w-64 pl-8`}
          />
        </div>
        <select
          aria-label="Filter by status"
          className={`${fieldClass} w-auto`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by tier"
          className={`${fieldClass} w-auto`}
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
        >
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by resume version"
          className={`${fieldClass} w-auto`}
          value={resumeFilter}
          onChange={(e) => setResumeFilter(e.target.value)}
        >
          <option value="">All resumes</option>
          {RESUME_VERSIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by source"
          className={`${fieldClass} w-auto`}
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {applications.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching applications"
          description="Try clearing a filter or search term."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                {COLUMNS.map((col) => (
                  <th key={col.key} scope="col" className="px-3 py-2 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1 text-foreground hover:text-primary"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>
                ))}
                <th scope="col" className="px-3 py-2 font-medium">
                  Applied with
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Referral
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    <Link
                      href={`/applications/${app.id}`}
                      className="hover:underline"
                    >
                      {app.company}
                    </Link>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {app.roleTitle}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      aria-label={`Change status for ${app.company}`}
                      value={app.status}
                      disabled={pendingId === app.id}
                      onChange={(e) =>
                        handleStatusChange(app.id, e.target.value as Status)
                      }
                      className="rounded-md border border-input bg-background px-1.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <TierBadge tier={app.tier} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDateInput(app.dateApplied) || "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDateInput(app.deadline) || "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDateInput(app.followUpDate) || "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDateInput(app.nextInterviewDate) || "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {app.applicationEmail ?? "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {app.referralName ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
