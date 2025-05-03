// src/utils/scheduler.ts
import { Section, SelectedClass } from '../types';
import { checkConflict, ClassSection } from './conflict';

function isOnlineMeeting(mtg: { startTime: string; endTime: string }) {
  // treat anything whose start or end indicates “ARR” or “ONLINE” as asynchronous
  return (
    mtg.startTime.includes('ARR') ||
    mtg.endTime.toUpperCase() === 'ONLINE'
  );
}

/**
 * Generate all valid schedules (one Section per SelectedClass) given user constraints.
 */
export function generateSchedules(
  selectedClasses: SelectedClass[],
  dayStart: string,
  dayEnd: string
): Section[][] {
  // helper to turn “HH:MMPM” into minutes past midnight
  const toMins = (t: string) => {
    if (!t.includes(':')) return 0;
    const [h, rest] = t.split(':');
    const m = parseInt(rest.slice(0, 2), 10);
    let hrs = parseInt(h, 10);
    const period = rest.slice(2).trim().toUpperCase();
    if (period === 'PM' && hrs !== 12) hrs += 12;
    if (period === 'AM' && hrs === 12) hrs = 0;
    return hrs * 60 + m;
  };
  const startWindow = toMins(dayStart);
  const endWindow   = toMins(dayEnd);

  // 1) Pull out any class that only has online meetings:
  const forcedOnline: Section[] = [];
  const toSchedule: SelectedClass[] = [];

  for (const cls of selectedClasses) {
    // get either the user‐picked CRN or all sections
    const pool = cls.selectedCRN !== 'N/A'
      ? cls.sections.filter(s => s.id === cls.selectedCRN)
      : cls.sections;

    const onlineOnly = pool.every(s =>
      s.meetings.every(isOnlineMeeting)
    );

    if (onlineOnly && pool.length) {
      // pick the first online section (they’re all equivalent async)
      forcedOnline.push(pool[0]);
    } else {
      // filter out any truly online sections — we only need to work with in‑person
      const inPersonSecs = pool.filter(s =>
        s.meetings.some(m => !isOnlineMeeting(m))
      );
      toSchedule.push({
        ...cls,
        sections: inPersonSecs.length ? inPersonSecs : pool
      });
    }
  }

  // 2) Build our backtracking “options” array
  const options: Section[][] = toSchedule.map(cls => cls.sections);

  const results: Section[][] = [];
  const path: Section[] = [];

  function backtrack(idx: number) {
    if (idx === options.length) {
      // prepend any forced‑online sections to each found schedule
      results.push([...forcedOnline, ...path]);
      return;
    }

    for (const sec of options[idx]) {
      // check each meeting of this section
      const meets = sec.meetings.filter(m => !isOnlineMeeting(m));
      // 2a) window‐check
      if (meets.some(m => {
        const s = toMins(m.startTime);
        const e = toMins(m.endTime);
        return s < startWindow || e > endWindow;
      })) continue;

      // 2b) conflict‐check
      // flatten path into ClassSection[] for easy conflict checking
      const existing: ClassSection[] = path.flatMap(ps =>
        ps.meetings
          .filter(m => !isOnlineMeeting(m))
          .map(m => ({
            crn: ps.id,
            courseName: ps.code,
            courseNumber: ps.code,
            days: m.days,
            startTime: m.startTime,
            endTime: m.endTime,
          }))
      );

      let bad = false;
      for (const m of meets) {
        const cand: ClassSection = {
          crn: sec.id,
          courseName: sec.code,
          courseNumber: sec.code,
          days: m.days,
          startTime: m.startTime,
          endTime: m.endTime,
        };
        if (checkConflict(cand, existing)) {
          bad = true;
          break;
        }
      }
      if (bad) continue;

      path.push(sec);
      backtrack(idx + 1);
      path.pop();
    }
  }

  backtrack(0);
  return results;
}
