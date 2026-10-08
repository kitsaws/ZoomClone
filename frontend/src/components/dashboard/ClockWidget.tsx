"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar as CalendarIcon, Sparkles } from "lucide-react";

export interface ClockWidgetProps {
  userName?: string;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ userName }) => {
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
      <div className="h-28 w-full bg-surface border border-app-border rounded-2xl animate-pulse" />
    );
  }

  // Format Time: 03:45 PM
  const timeString = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Format Date: Friday, October 9, 2026
  const dateString = currentTime.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Greeting
  const hours = currentTime.getHours();
  let greeting = "Good evening";
  if (hours < 12) greeting = "Good morning";
  else if (hours < 17) greeting = "Good afternoon";

  return (
    <div className="bg-surface border border-app-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-zoom-blue" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Zoom Workplace
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          {greeting}, {userName || "Guest"}!
        </h1>
        <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-0.5">
          <CalendarIcon className="h-3.5 w-3.5 text-zoom-blue" />
          <span>{dateString}</span>
        </p>
      </div>

      <div className="bg-surface-subtle border border-app-border rounded-xl px-5 py-3 flex items-center gap-3 shadow-inner">
        <Clock className="h-6 w-6 text-zoom-blue animate-pulse" />
        <div className="text-right">
          <p className="text-2xl sm:text-3xl font-mono font-bold text-text-primary tracking-tight">
            {timeString}
          </p>
        </div>
      </div>
    </div>
  );
};
