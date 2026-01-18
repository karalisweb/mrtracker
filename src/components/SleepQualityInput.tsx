"use client";

import { useState } from "react";
import { formatTime } from "@/lib/utils";

interface SleepQualityInputProps {
  onSave: (quality: number) => void;
  onCancel: () => void;
}

export function SleepQualityInput({ onSave, onCancel }: SleepQualityInputProps) {
  const [quality, setQuality] = useState("");
  const now = new Date();

  const handleSave = () => {
    const value = parseInt(quality);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onSave(value);
    }
  };

  const isValid = quality !== "" && !isNaN(parseInt(quality)) && parseInt(quality) >= 0 && parseInt(quality) <= 100;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Sveglia</h2>

        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">Ora attuale</p>
          <p className="text-4xl font-bold">{formatTime(now)}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3 text-center">Qualità sonno (%)</p>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="100"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            placeholder="0-100"
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white text-3xl font-bold text-center focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
}
