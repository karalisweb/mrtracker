"use client";

import { useState } from "react";
import { cn, formatTime } from "@/lib/utils";

interface SleepQualityInputProps {
  onSave: (quality: number) => void;
  onCancel: () => void;
}

export function SleepQualityInput({ onSave, onCancel }: SleepQualityInputProps) {
  const [quality, setQuality] = useState(70);
  const now = new Date();

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
          <input
            type="range"
            min="0"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer"
          />
          <p className={cn(
            "text-center text-3xl font-bold mt-3",
            quality >= 70 ? "text-green-400" :
            quality >= 40 ? "text-yellow-400" : "text-red-400"
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
