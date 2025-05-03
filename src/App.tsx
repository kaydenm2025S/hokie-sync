// src/App.tsx
import React, { useState } from 'react';
import { CourseSelection } from './components/CourseSelection';
import { Schedule } from './components/Schedule';
import { TermSelector } from './components/TermSelector';
import { TimeSelector } from './components/TimeSelector';
import { SelectedClass } from './types';

function App() {
  const [term, setTerm] = useState('202509');   // e.g. "202509"
  const [startTime, setStartTime] = useState('08:00AM');
  const [endTime, setEndTime] = useState('06:00PM');
  const [selectedCourses, setSelectedCourses] = useState<SelectedClass[]>([]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* — VT‑Themed Header — */}
      <header className="w-full py-6 bg-gradient-to-r from-red-800 to-orange-500 mb-8">
        <h1 className="text-4xl font-extrabold text-white text-center tracking-wide">
          Hokie Sync
        </h1>
      </header>

      {/* — Main Container (full‑width but constrained) — */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Term & Time Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <TermSelector term={term} setTerm={setTerm} />
          <TimeSelector
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
          />
        </div>

        {/* Course Search & Selection */}
        <CourseSelection
          termCode={term}
          selectedClasses={selectedCourses}
          setSelectedClasses={setSelectedCourses}
        />

        {/* Schedule & Printable Area */}
        <div className="printable mt-8">
          <Schedule
            selectedClasses={selectedCourses}
            dayStart={startTime}
            dayEnd={endTime}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
