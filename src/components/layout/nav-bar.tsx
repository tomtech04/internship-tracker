"use client";

import {
  LayoutDashboard,
  KanbanSquare,
  Table2,
  Building2,
  Users,
  DatabaseBackup,
  Menu,
  X,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/board", label: "Board", icon: KanbanSquare },
  { href: "/table", label: "Table", icon: Table2 },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/data", label: "Data", icon: DatabaseBackup },
];

export function NavBar({ onQuickAdd }: { onQuickAdd: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-border bg-card/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            🚀 Internship Tracker
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onQuickAdd}
            className="bg-primary text-primary-foreground hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 sm:flex"
          >
            <Plus size={16} />
            Quick add
            <kbd className="ml-1 rounded border border-white/30 px-1 text-xs opacity-80">
              N
            </kbd>
          </button>
          <ThemeToggle />
          <button
            type="button"
            className="border-border flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-border border-t px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onQuickAdd();
            }}
            className="bg-primary text-primary-foreground mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium"
          >
            <Plus size={16} />
            Quick add
          </button>
        </nav>
      )}
    </header>
  );
}
