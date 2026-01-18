"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/utils";

interface WorkoutModalProps {
  duration: number | null;
  onSave: (data: WorkoutData) => void;
  onSkip: () => void;
}

export interface WorkoutData {
  bpm: number | null;
  calories: number | null;
  zone1: number | null;
  zone2: number | null;
  zone3: number | null;
  zone4: number | null;
}

export function WorkoutModal({
  duration,
  onSave,
  onSkip,
}: WorkoutModalProps) {
  const [bpm, setBpm] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [zone1, setZone1] = useState<string>("");
  const [zone2, setZone2] = useState<string>("");
  const [zone3, setZone3] = useState<string>("");
  const [zone4, setZone4] = useState<string>("");

  const handleSave = () => {
    const data: WorkoutData = {
      bpm: bpm ? parseInt(bpm) : null,
      calories: calories ? parseInt(calories) : null,
      zone1: zone1 ? parseInt(zone1) : null,
      zone2: zone2 ? parseInt(zone2) : null,
      zone3: zone3 ? parseInt(zone3) : null,
      zone4: zone4 ? parseInt(zone4) : null,
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-2 text-center">Allenamento</h2>
        {duration !== null && (
          <p className="text-center text-gray-400 mb-4">
            Durata: <span className="text-white font-semibold">{formatDuration(duration)}</span>
          </p>
        )}

        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">BPM medio</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="120"
                className="input-field text-center"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Calorie</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="250"
                className="input-field text-center"
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-2 block text-center">% Zone cardiache</label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-blue-400 text-xs mb-1 block text-center">Z1</label>
                <input
                  type="number"
                  value={zone1}
                  onChange={(e) => setZone1(e.target.value)}
                  placeholder="%"
                  className="input-field text-center text-sm"
                  inputMode="numeric"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-green-400 text-xs mb-1 block text-center">Z2</label>
                <input
                  type="number"
                  value={zone2}
                  onChange={(e) => setZone2(e.target.value)}
                  placeholder="%"
                  className="input-field text-center text-sm"
                  inputMode="numeric"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-yellow-400 text-xs mb-1 block text-center">Z3</label>
                <input
                  type="number"
                  value={zone3}
                  onChange={(e) => setZone3(e.target.value)}
                  placeholder="%"
                  className="input-field text-center text-sm"
                  inputMode="numeric"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-red-400 text-xs mb-1 block text-center">Z4</label>
                <input
                  type="number"
                  value={zone4}
                  onChange={(e) => setZone4(e.target.value)}
                  placeholder="%"
                  className="input-field text-center text-sm"
                  inputMode="numeric"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="btn-secondary flex-1"
          >
            Salta
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
}
