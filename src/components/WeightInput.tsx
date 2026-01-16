"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface WeightInputProps {
  onSave: (weight: number) => void;
  onCancel: () => void;
  previousWeight?: number | null;
}

export function WeightInput({ onSave, onCancel, previousWeight }: WeightInputProps) {
  const [value, setValue] = useState("");

  const weight = parseFloat(value);
  const isValid = !isNaN(weight) && weight > 0 && weight < 300;
  const delta = isValid && previousWeight
    ? Math.round((weight - previousWeight) * 10) / 10
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Peso</h2>

        <div className="mb-6">
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="78.5"
              className="input-field text-center text-3xl font-bold pr-12"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              kg
            </span>
          </div>
        </div>

        {previousWeight && (
          <div className="text-center mb-6 text-gray-400">
            <p>Ieri: <span className="font-semibold text-white">{previousWeight} kg</span></p>
            {delta !== null && (
              <p className={cn(
                "text-lg font-bold mt-1",
                delta < 0 ? "text-green-400" : delta > 0 ? "text-red-400" : "text-gray-400"
              )}>
                {delta > 0 ? "+" : ""}{delta} kg
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Annulla
          </button>
          <button
            onClick={() => isValid && onSave(weight)}
            disabled={!isValid}
            className="btn-primary flex-1"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
}
