// src/utils/scheduler.ts
import { Section, SelectedClass } from '../types';
import { checkConflict, ClassSection } from './conflict';

/**
 * Generate all valid schedules (one Section per SelectedClass) given user constraints.
 *
 * @param selectedClasses - array of classes the user selected (with available sections)
 * @param dayStart - earliest time classes can start ("HH:MMAM" or "HH:MMPM")
 * @param dayEnd - latest time classes can end
 * @returns nested array of Section[][], each inner array is one valid schedule combination
 */
export function generateSchedules(
  selectedClasses: SelectedClass[],
  dayStart: string,
  dayEnd: string
): Section[][] {
  const timeToMinutes = (time: string) => {
    if (!time.includes(':')) return 0;
    const [h, mPart] = time.split(':');
    const m = parseInt(mPart.slice(0, 2), 10);
    const period = mPart.slice(2).trim().toUpperCase();
    let hours = parseInt(h, 10);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + m;
  };

  const startWindow = timeToMinutes(dayStart);
  const endWindow   = timeToMinutes(dayEnd);

  // 1) Build options per class (filter if they've picked a specific CRN)
  const options: Section[][] = selectedClasses.map((cls) => {
    const pool =
      cls.selectedCRN !== 'N/A'
        ? cls.sections.filter(sec => sec.id === cls.selectedCRN)
        : cls.sections;
    if (!pool.length) {
      console.warn(`No sections available for ${cls.code}`);
    }
    return pool;
  });

  const results: Section[][] = [];
  const path: Section[] = [];

  function backtrack(idx: number) {
    if (idx === options.length) {
      results.push([...path]);
      return;
    }

    for (const sec of options[idx]) {
      // 2) Window‐check every meeting
      const meets = sec.meetings;
      if (meets.some(mtg => {
        const s = timeToMinutes(mtg.startTime);
        const e = timeToMinutes(mtg.endTime);
        return s < startWindow || e > endWindow;
      })) continue;

      // 3) Flatten existing path into ClassSection[] for conflict checking
      const existing: ClassSection[] = path.flatMap(ps =>
        ps.meetings.map(mtg => ({
          crn: ps.id,
          courseName: ps.code,
          courseNumber: ps.code,
          days: mtg.days,
          startTime: mtg.startTime,
          endTime: mtg.endTime,
        }))
      );

      // 4) Check each new meeting against existing
      let conflict = false;
      for (const mtg of meets) {
        const candidate: ClassSection = {
          crn: sec.id,
          courseName: sec.code,
          courseNumber: sec.code,
          days: mtg.days,
          startTime: mtg.startTime,
          endTime: mtg.endTime,
        };
        if (checkConflict(candidate, existing)) {
          conflict = true;
          break;
        }
      }
      if (conflict) continue;

      // 5) No conflicts, recurse
      path.push(sec);
      backtrack(idx + 1);
      path.pop();
    }
  }

  backtrack(0);
  return results;
}
