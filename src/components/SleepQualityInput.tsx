"use client";

import { useState } from "react";
import { cn, formatTime } from "@/lib/utils";

interface SleepQualityInputProps {
  onSave: (quality: number) => void;
  onCancel: () => void;
}

const SLEEP_QUALITY_OPTIONS = [
  { value: 100, label: "Ottimo", color: "text-green-400" },
  { value: 80, label: "Buono", color: "text-green-400" },
  { value: 60, label: "Discreto", color: "text-yellow-400" },
  { value: 40, label: "Sufficiente", color: "text-yellow-400" },
  { value: 20, label: "Scarso", color: "text-red-400" },
];

export function SleepQualityInput({ onSave, onCancel }: SleepQualityInputProps) {
  const [quality, setQuality] = useState(80);
  const now = new Date();

  const selectedOption = SLEEP_QUALITY_OPTIONS.find(opt => opt.value === quality);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Sveglia</h2>

        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">Ora attuale</p>
          <p className="text-4xl font-bold">{formatTime(now)}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3 text-center">Qualita sonno</p>
          <select
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-lg font-semibold text-center appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
          >
            {SLEEP_QUALITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.value}%)
              </option>
            ))}
          </select>
          <p className={cn(
            "text-center text-3xl font-bold mt-3",
            selectedOption?.color || "text-gray-400"
          )}>
            {quality}%
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Annulla
          </button>
          <button
            onClick={() => onSave(quality)}
            className="btn-primary flex-1"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
}
