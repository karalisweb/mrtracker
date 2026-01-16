"use client";

import { formatDate } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/activities";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "MR Tracker" }: HeaderProps) {
  const today = new Date();

  return (
    <header className="px-4 py-3 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-gray-400">{formatDate(today)}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-400">Obiettivo</p>
        <p className="text-lg font-semibold text-green-400">
          {APP_CONFIG.targetEndTime}
        </p>
      </div>
    </header>
  );
}
