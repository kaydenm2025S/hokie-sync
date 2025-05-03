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
    '08:00AM', '09:00AM', '10:00AM', '11:00AM',
    '12:00PM', '01:00PM', '02:00PM', '03:00PM',
    '04:00PM', '05:00PM', '06:00PM', '07:00PM',
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
