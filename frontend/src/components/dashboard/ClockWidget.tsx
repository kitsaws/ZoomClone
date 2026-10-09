"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ClockWidgetProps {
  className?: string;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ className }) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentTime) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-2 select-none", className)}>
        <div className="h-10 w-32 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-44 bg-gray-100 dark:bg-zinc-900 rounded mt-2 animate-pulse" />
      </div>
    );
  }

  // Format Time: 14:39
  const hours = String(currentTime.getHours()).padStart(2, "0");
  const minutes = String(currentTime.getMinutes()).padStart(2, "0");
  const timeString = `${hours}:${minutes}`;

  // Format Date: Friday, October 9, 2026
  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={cn("flex flex-col items-center justify-center text-center select-none pt-2 pb-1", className)}>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1F2429] dark:text-zinc-100 font-sans">
        {timeString}
      </h1>
      <p className="text-xs sm:text-sm text-[#666B72] dark:text-zinc-400 mt-1 font-medium">
        {dateString}
      </p>
    </div>
  );
};
