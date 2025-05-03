import { FC, useState } from 'react';
import { SelectedClass, Section } from '../types';
import { generateSchedules } from '../utils/scheduleUtil';
import { CalendarGrid } from './CalendarGrid';

interface ScheduleProps {
  selectedClasses: SelectedClass[];
  dayStart: string;
  dayEnd: string;
}

export const Schedule: FC<ScheduleProps> = ({
  selectedClasses, dayStart, dayEnd
}) => {
  const [schedules, setSchedules]     = useState<Section[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGenerate = () => {
    const result = generateSchedules(selectedClasses, dayStart, dayEnd);  
    setSchedules(result);
    setCurrentIndex(0);
  };

  const prev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const next = () => setCurrentIndex(i => Math.min(schedules.length - 1, i + 1));

  // current is an array of Sections (each with meetings[])
  const current = schedules[currentIndex] || [];

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Your Schedule</h2>
      <button
        onClick={handleGenerate}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Generate Schedule
      </button>

      {schedules.length > 0 && (
        <>
          {/* Summary Table */}
          <div className="overflow-auto mb-4">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">CRN</th>
                  <th className="border p-2">Course</th>
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Days</th>
                  <th className="border p-2">Start</th>
                  <th className="border p-2">End</th>
                </tr>
              </thead>
              <tbody>
                {current.flatMap(sec =>
                  sec.meetings.map((mtg, idx) => (
                    <tr key={`${sec.id}-${idx}`} className="hover:bg-gray-100">
                      <td className="border p-2">{sec.id}</td>
                      <td className="border p-2">{sec.code}</td>
                      <td className="border p-2">{sec.title}</td>
                      <td className="border p-2">{mtg.days.join(', ')}</td>
                      <td className="border p-2">{mtg.startTime}</td>
                      <td className="border p-2">{mtg.endTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-2">
            <button onClick={prev} className="text-gray-600 hover:text-gray-900">
              &lt; Prev
            </button>
            <span className="font-semibold">
              Schedule {currentIndex + 1} of {schedules.length}
            </span>
            <button onClick={next} className="text-gray-600 hover:text-gray-900">
              Next &gt;
            </button>
          </div>

          {/* Calendar Grid */}
          <CalendarGrid
            sections={current}
            dayStart={dayStart}
            dayEnd={dayEnd}
          />
        </>
      )}
    </div>
  );
};
