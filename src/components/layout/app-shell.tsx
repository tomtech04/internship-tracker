"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { NavBar } from "./nav-bar";
import { QuickAddModal } from "./quick-add-modal";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const openQuickAdd = useCallback(() => setQuickAddOpen(true), []);
  const closeQuickAdd = useCallback(() => setQuickAddOpen(false), []);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "n") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      setQuickAddOpen(true);
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <NavBar onQuickAdd={openQuickAdd} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>
      <QuickAddModal open={quickAddOpen} onClose={closeQuickAdd} />
    </div>
  );
}
