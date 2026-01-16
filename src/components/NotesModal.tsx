"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/utils";

interface NotesModalProps {
  activityName: string;
  duration: number | null;
  onSave: (notes: string) => void;
  onSkip: () => void;
}

export function NotesModal({
  activityName,
  duration,
  onSave,
  onSkip,
}: NotesModalProps) {
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-2 text-center">{activityName}</h2>
        {duration !== null && (
          <p className="text-center text-gray-400 mb-6">
            Durata: <span className="text-white font-semibold">{formatDuration(duration)}</span>
          </p>
        )}

        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">
            Note (opzionale)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aggiungi note..."
            rows={3}
            className="input-field resize-none"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="btn-secondary flex-1"
          >
            Salta
          </button>
          <button
            onClick={() => onSave(notes)}
            className="btn-primary flex-1"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
}
