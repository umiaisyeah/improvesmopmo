import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RealTimeClockProps {
  className?: string;
  showSeconds?: boolean;
}

export const RealTimeClock: React.FC<RealTimeClockProps> = ({
  className = '',
  showSeconds = true,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    // Tick every 1 second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format date in Indonesian locale
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(currentDateTime);

  // Format time in 24-hour Indonesian WIB format
  const hours = String(currentDateTime.getHours()).padStart(2, '0');
  const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium select-none shadow-xs transition-colors ${className}`}
      title="Waktu Nyata Operasional Sistem (WIB)"
    >
      <div className="flex items-center gap-1.5 text-[#0054a6] dark:text-cyan-400">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      </div>

      {/* Date */}
      <span className="font-semibold text-slate-800 dark:text-slate-100 hidden sm:inline whitespace-nowrap">
        {formattedDate}
      </span>

      <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">&bull;</span>

      {/* Real-time Ticking Time */}
      <span className="font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
        {hours}:{minutes}
        {showSeconds && (
          <span className="text-cyan-600 dark:text-cyan-400 font-bold">
            :{seconds}
          </span>
        )}
        <span className="ml-1 text-[10px] font-sans font-semibold text-slate-500 dark:text-slate-400">
          WIB
        </span>
      </span>
    </div>
  );
};
