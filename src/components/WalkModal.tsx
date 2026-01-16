"use client";

import { Icon } from "./Icons";

interface WalkModalProps {
  onStart: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

export function WalkModal({ onStart, onSkip, onCancel }: WalkModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <Icon name="footprints" size={48} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-bold">Passeggiata</h2>
          <p className="text-gray-400 text-sm mt-2">Attivita opzionale</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onStart}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Icon name="play" size={20} />
            Inizia
          </button>
          <button
            onClick={onSkip}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Icon name="skip" size={20} />
            Salta oggi
          </button>
          <button
            onClick={onCancel}
            className="text-gray-400 text-sm py-2"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
