import { useState } from 'react';
import { CourseSelection } from './components/CourseSelection';
import { Schedule } from './components/Schedule';
import { TermSelector } from './components/TermSelector';
import { TimeSelector } from './components/TimeSelector';
import { SelectedClass } from './types';

function App() {
  const [term, setTerm] = useState('202509');            // termCode now e.g. "202509"
  const [startTime, setStartTime] = useState('08:00AM');
  const [endTime, setEndTime] = useState('06:00PM');
  const [selectedCourses, setSelectedCourses] = useState<SelectedClass[]>([]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Course Scheduler</h1>

      {/* term codes: 202501, 202506, 202509 */}
      <TermSelector term={term} setTerm={setTerm} />

      {/* optional time filtering */}
      <TimeSelector
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
      />

      {/* Search & add */}
      <CourseSelection
        termCode={term}
        selectedClasses={selectedCourses}
        setSelectedClasses={setSelectedCourses}
      />

      {/* Display */}
      <Schedule
        selectedClasses={selectedCourses}   // lowercase ‘s’
        dayStart={startTime}
        dayEnd={endTime}
      />
    </div>
  );
}

export default App;
