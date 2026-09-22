"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateApplicationStatus } from "@/actions/applications";
import { BOARD_STATUSES, type Status } from "@/lib/constants";

import { ApplicationCard, type BoardApplication } from "./application-card";
import { KanbanColumn } from "./kanban-column";

type BoardApp = BoardApplication & { status: Status };

export function KanbanBoard({
  applications,
}: {
  applications: BoardApp[];
}) {
  const [items, setItems] = useState(applications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as Status;
    const app = items.find((a) => a.id === active.id);
    if (!app || app.status === newStatus) return;
    const previousStatus = app.status;

    setItems((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a)),
    );

    startTransition(async () => {
      const result = await updateApplicationStatus(app.id, newStatus);
      if (!result.success) {
        setItems((prev) =>
          prev.map((a) =>
            a.id === app.id ? { ...a, status: previousStatus } : a,
          ),
        );
      } else {
        router.refresh();
      }
    });
  }

  const activeApp = activeId ? items.find((a) => a.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {BOARD_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={items.filter((a) => a.status === status)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeApp ? <ApplicationCard application={activeApp} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
