"use client";

import { useState, useEffect } from "react";
import { ACTIVITIES, getActivityById } from "@/lib/activities";
import { useDailyLog } from "@/hooks/useDailyLog";
import { useActivity } from "@/hooks/useActivity";
import { ActivityButton } from "@/components/ActivityButton";
import { ProgressBar } from "@/components/ProgressBar";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { WeightInput } from "@/components/WeightInput";
import { SleepQualityInput } from "@/components/SleepQualityInput";
import { NotesModal } from "@/components/NotesModal";
import { WalkModal } from "@/components/WalkModal";
import { WorkoutModal, WorkoutData } from "@/components/WorkoutModal";

type Modal =
  | { type: "weight" }
  | { type: "sleep" }
  | { type: "notes"; activityId: string; duration: number | null }
  | { type: "workout"; duration: number | null }
  | { type: "walk" }
  | null;

export default function HomePage() {
  const { data, loading, refresh } = useDailyLog();
  const {
    startActivity,
    stopActivity,
    setWeight,
    setWakeUp,
    setTime,
    skipActivity,
    resetActivity,
  } = useActivity(refresh);

  const [modal, setModal] = useState<Modal>(null);
  const [previousWeight, setPreviousWeight] = useState<number | null>(null);
  const [pendingStop, setPendingStop] = useState<{
    activityId: string;
    duration: number;
  } | null>(null);

  useEffect(() => {
    const fetchPreviousWeight = async () => {
      try {
        const response = await fetch("/api/weight?days=7");
        if (response.ok) {
          const data = await response.json();
          if (data.data.length > 0) {
            setPreviousWeight(data.data[data.data.length - 1].weight);
          }
        }
      } catch {
        console.error("Failed to fetch previous weight");
      }
    };
    fetchPreviousWeight();
  }, []);

  const handleActivityTap = async (activityId: string) => {
    if (!data) return;

    const activityData = data.activities[activityId];
    const activity = getActivityById(activityId);

    if (!activity || !activityData) return;

    switch (activityData.state) {
      case "pending":
        if (activityId === "wake_up") {
          setModal({ type: "sleep" });
        } else if (activityId === "weight") {
          setModal({ type: "weight" });
        } else if (activityId === "walk") {
          setModal({ type: "walk" });
        } else if (activity.type === "time_only") {
          // Tap singolo segna l'ora (es. Acqua + Caffè)
          await setTime(activityId);
        } else {
          await startActivity(activityId);
        }
        break;

      case "active":
        const startTime = new Date(activityData.startTime!).getTime();
        const duration = Math.round((Date.now() - startTime) / 60000);

        if (activityId === "workout") {
          setPendingStop({ activityId, duration });
          setModal({ type: "workout", duration });
        } else if (activity.hasNotes) {
          setPendingStop({ activityId, duration });
          setModal({ type: "notes", activityId, duration });
        } else {
          await stopActivity(activityId);
        }
        break;

      case "completed":
      case "skipped":
        break;
    }
  };

  const handleWeightSave = async (weight: number) => {
    await setWeight(weight);
    setModal(null);
  };

  const handleSleepSave = async (quality: number) => {
    await setWakeUp(quality);
    setModal(null);
  };

  const handleNotesSave = async (notes: string) => {
    if (pendingStop) {
      await stopActivity(pendingStop.activityId, notes);
      setPendingStop(null);
    }
    setModal(null);
  };

  const handleNotesSkip = async () => {
    if (pendingStop) {
      await stopActivity(pendingStop.activityId);
      setPendingStop(null);
    }
    setModal(null);
  };

  const handleWorkoutSave = async (data: WorkoutData) => {
    if (pendingStop) {
      // Salva i dati come JSON nel campo notes
      const notes = JSON.stringify(data);
      await stopActivity(pendingStop.activityId, notes);
      setPendingStop(null);
    }
    setModal(null);
  };

  const handleWorkoutSkip = async () => {
    if (pendingStop) {
      await stopActivity(pendingStop.activityId);
      setPendingStop(null);
    }
    setModal(null);
  };

  const handleWalkStart = async () => {
    await startActivity("walk");
    setModal(null);
  };

  const handleWalkSkip = async () => {
    await skipActivity("walk");
    setModal(null);
  };

  const handleActivityReset = async (activityId: string) => {
    await resetActivity(activityId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Caricamento...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Errore nel caricamento</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="px-4">
        <div className="mb-6">
          <ProgressBar
            percentage={data.summary.percentage}
            onTrack={data.summary.onTrack}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ACTIVITIES.map((activity) => (
            <ActivityButton
              key={activity.id}
              activity={activity}
              data={data.activities[activity.id]}
              onTap={() => handleActivityTap(activity.id)}
              onReset={() => handleActivityReset(activity.id)}
            />
          ))}
        </div>
      </main>

      <Navigation />

      {modal?.type === "weight" && (
        <WeightInput
          onSave={handleWeightSave}
          onCancel={() => setModal(null)}
          previousWeight={previousWeight}
        />
      )}

      {modal?.type === "sleep" && (
        <SleepQualityInput
          onSave={handleSleepSave}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === "notes" && (
        <NotesModal
          activityName={getActivityById(modal.activityId)?.name || ""}
          duration={modal.duration}
          onSave={handleNotesSave}
          onSkip={handleNotesSkip}
        />
      )}

      {modal?.type === "workout" && (
        <WorkoutModal
          duration={modal.duration}
          onSave={handleWorkoutSave}
          onSkip={handleWorkoutSkip}
        />
      )}

      {modal?.type === "walk" && (
        <WalkModal
          onStart={handleWalkStart}
          onSkip={handleWalkSkip}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
