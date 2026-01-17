// src/lib/activities.ts
// MR Tracker - Configurazione Attivita

export type ActivityType = "time_only" | "value" | "duration" | "duration_optional";

export interface Activity {
  id: string;
  name: string;
  icon: string;
  type: ActivityType;
  hasNotes: boolean;
  order: number;
  target?: number;
  optional?: boolean;
  dbStartField?: string;
  dbEndField?: string;
  dbValueField?: string;
  dbNotesField?: string;
}

export const ACTIVITIES: Activity[] = [
  {
    id: "wake_up",
    name: "Sveglia",
    icon: "clock",
    type: "time_only",
    hasNotes: false,
    order: 1,
    dbValueField: "wakeUpTime",
  },
  {
    id: "weight",
    name: "Peso",
    icon: "scale",
    type: "value",
    hasNotes: false,
    order: 2,
    dbValueField: "weight",
  },
  {
    id: "water_coffee",
    name: "Acqua + Caffe",
    icon: "droplet",
    type: "time_only",
    hasNotes: false,
    order: 3,
    dbValueField: "waterCoffeeStart",
  },
  {
    id: "workout_prep",
    name: "Prep Allenamento",
    icon: "shirt",
    type: "duration",
    hasNotes: false,
    order: 4,
    dbStartField: "workoutPrepStart",
    dbEndField: "workoutPrepEnd",
  },
  {
    id: "workout",
    name: "Allenamento",
    icon: "dumbbell",
    type: "duration",
    hasNotes: true,
    order: 5,
    target: 25,
    dbStartField: "workoutStart",
    dbEndField: "workoutEnd",
    dbNotesField: "workoutNotes",
  },
  {
    id: "tidy_room",
    name: "Riordino Stanza",
    icon: "bed",
    type: "duration",
    hasNotes: false,
    order: 6,
    dbStartField: "tidyRoomStart",
    dbEndField: "tidyRoomEnd",
  },
  {
    id: "coffee_supps",
    name: "Caffe + Integratori",
    icon: "coffee",
    type: "duration",
    hasNotes: false,
    order: 7,
    dbStartField: "coffeeSuppsStart",
    dbEndField: "coffeeSuppsEnd",
  },
  {
    id: "shower",
    name: "Doccia",
    icon: "shower-head",
    type: "duration",
    hasNotes: false,
    order: 8,
    dbStartField: "showerStart",
    dbEndField: "showerEnd",
  },
  {
    id: "journal",
    name: "Diario",
    icon: "notebook-pen",
    type: "duration",
    hasNotes: false,
    order: 9,
    dbStartField: "journalStart",
    dbEndField: "journalEnd",
  },
  {
    id: "reading",
    name: "Lettura Tecnica",
    icon: "book-open",
    type: "duration",
    hasNotes: true,
    order: 10,
    target: 10,
    dbStartField: "readingStart",
    dbEndField: "readingEnd",
    dbNotesField: "readingNotes",
  },
  {
    id: "lauds",
    name: "Lodi con Daniela",
    icon: "hands-praying",
    type: "duration",
    hasNotes: false,
    order: 11,
    dbStartField: "laudsStart",
    dbEndField: "laudsEnd",
  },
  {
    id: "breakfast",
    name: "Colazione",
    icon: "utensils",
    type: "duration",
    hasNotes: false,
    order: 12,
    dbStartField: "breakfastStart",
    dbEndField: "breakfastEnd",
  },
  {
    id: "walk",
    name: "Passeggiata",
    icon: "footprints",
    type: "duration_optional",
    hasNotes: true,
    order: 13,
    optional: true,
    dbStartField: "walkStart",
    dbEndField: "walkEnd",
    dbNotesField: "walkNotes",
  },
];

export const APP_CONFIG = {
  targetEndTime: "07:00",
  reportEmail: "alessio@karalisweb.net",
  reportDay: 0,
  timezone: "Europe/Rome",
};

export function getActivityById(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}

export function getActivitiesWithDuration(): Activity[] {
  return ACTIVITIES.filter((a) => a.type === "duration" || a.type === "duration_optional");
}

export function getRequiredActivities(): Activity[] {
  return ACTIVITIES.filter((a) => !a.optional);
}

export function getOptionalActivities(): Activity[] {
  return ACTIVITIES.filter((a) => a.optional);
}
