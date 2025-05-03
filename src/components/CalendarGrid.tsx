import React, { FC, useMemo } from 'react';
import { Section } from '../types';

interface CalendarGridProps {
  sections: Section[];
  dayStart: string;  // e.g. "08:00AM"
  dayEnd: string;    // e.g. "06:00PM"
}

const COLORS = [
  'bg-blue-300','bg-green-300','bg-yellow-300',
  'bg-red-300','bg-purple-300','bg-indigo-300','bg-pink-300',
];

export const CalendarGrid: FC<CalendarGridProps> = ({ sections, dayStart, dayEnd }) => {
  const timeToMinutes = (time: string) => {
    const [h, mPart] = time.split(':');
    const m = parseInt(mPart.slice(0,2), 10);
    const period = mPart.slice(2).toUpperCase();
    let hours = parseInt(h, 10);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + m;
  };

  const startMin = timeToMinutes(dayStart);
  const endMin   = timeToMinutes(dayEnd);
  const totalHours  = Math.ceil((endMin - startMin) / 60);
  const hourHeight = 64; // px per hour row
  const days = ['M','T','W','R','F'];

  const colorMap = useMemo(() => {
    const map: Record<string,string> = {};
    let idx = 0;
    sections.forEach(sec => {
      if (!map[sec.code]) map[sec.code] = COLORS[idx++ % COLORS.length];
    });
    return map;
  }, [sections]);

  return (
    <div className="relative">
      {/* — Grid base — */}
      <div className="grid grid-rows-1 auto-rows-fr grid-cols-6 border z-0">
        <div/> {/* corner */} 
        {days.map(d => (
          <div key={d} className="border-l border-b p-2 text-center font-semibold">
            {d}
          </div>
        ))}

        {Array.from({ length: totalHours }, (_, i) => {
          const hourMin  = startMin + i * 60;
          const hourLabel = `${(hourMin/60)%12 || 12}:00${hourMin >= 720 ? 'PM':'AM'}`;
          return (
            <React.Fragment key={hourLabel}>
              <div className="border-t border-r p-2 text-sm">{hourLabel}</div>
              {days.map((_, j) => (
                <div
                  key={j}
                  className="border-t border-l"
                  style={{ minHeight: `${hourHeight}px` }}
                />
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {/* — Meetings overlay — */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {sections.flatMap(sec =>
          sec.meetings.flatMap((mtg, mi) =>
            mtg.days.map(day => {
              const colIndex = days.indexOf(day);
              if (colIndex < 0) return null;

              const secStart = timeToMinutes(mtg.startTime);
              const secEnd   = timeToMinutes(mtg.endTime);
              const top    = ((secStart - startMin)/60) * hourHeight + hourHeight;
              const height = ((secEnd - secStart)/60) * hourHeight;
              const left   = ((colIndex + 1)/6) * 100;

              return (
                <div
                  key={`${sec.id}-${mi}-${day}`}
                  className={`${colorMap[sec.code]} opacity-90 p-1 rounded text-xs text-center absolute`}
                  style={{
                    top:    `${top}px`,
                    height: `${height}px`,
                    left:   `calc(${left}% + 1px)`,
                    width: `calc(100% / 6 - 2px)`,
                  }}
                >
                  <div className="font-semibold">{sec.code}</div>
                  <div>{`${mtg.startTime}-${mtg.endTime}`}</div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};
