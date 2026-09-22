"use client";

import { format } from "date-fns";
import {
  ArrowRightLeft,
  CalendarClock,
  Mail,
  MessageSquare,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addManualEvent, deleteEvent } from "@/actions/events";
import { Button } from "@/components/common/button";
import { fieldClass } from "@/components/common/form-fields";
import { EVENT_TYPES, type EventType } from "@/lib/constants";

type EventRow = {
  id: string;
  type: string;
  date: Date;
  description: string;
};

const EVENT_ICONS: Record<string, typeof MessageSquare> = {
  "Status Change": ArrowRightLeft,
  Note: MessageSquare,
  Email: Mail,
  Interview: Users,
  "Follow-up": CalendarClock,
};

export function EventTimeline({
  applicationId,
  events,
}: {
  applicationId: string;
  events: EventRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<EventType>("Note");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addManualEvent({
        applicationId,
        type,
        date,
        description,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDescription("");
      router.refresh();
    });
  }

  function handleDelete(eventId: string) {
    startTransition(async () => {
      await deleteEvent(eventId, applicationId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Event type"
            className={`${fieldClass} w-auto`}
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
          >
            {EVENT_TYPES.filter((t) => t !== "Status Change").map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            aria-label="Event date"
            type="date"
            className={`${fieldClass} w-auto`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <textarea
          aria-label="Event description"
          placeholder="What happened?"
          rows={2}
          className={fieldClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div>
          <Button type="submit" size="sm" disabled={isPending}>
            Add to timeline
          </Button>
        </div>
      </form>

      <ol className="flex flex-col gap-3">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">No timeline entries yet.</p>
        )}
        {events.map((event) => {
          const Icon = EVENT_ICONS[event.type] ?? MessageSquare;
          return (
            <li key={event.id} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {event.type} · {format(event.date, "MMM d, yyyy")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    disabled={isPending}
                    aria-label="Delete timeline entry"
                    className="text-muted-foreground hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-0.5 text-sm whitespace-pre-wrap text-foreground">
                  {event.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
