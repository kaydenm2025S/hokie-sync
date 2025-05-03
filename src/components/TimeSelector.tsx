import { FC } from 'react';

interface TimeSelectorProps {
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
}

export const TimeSelector: FC<TimeSelectorProps> = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}) => {
  const times = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  ];

  return (
    <div className="mb-4">
      <label className="font-semibold">Start Time:</label>
      <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border rounded p-1 ml-2">
        {times.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <label className="font-semibold ml-4">End Time:</label>
      <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border rounded p-1 ml-2">
        {times.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
};
