"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "./Icons";

const navItems = [
  { href: "/", label: "Oggi", icon: "home" },
  { href: "/stats", label: "Stats", icon: "bar-chart" },
  { href: "/history", label: "Storico", icon: "calendar" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-20 h-full",
                "transition-colors",
                isActive ? "text-blue-500" : "text-gray-500"
              )}
            >
              <Icon name={item.icon} size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
