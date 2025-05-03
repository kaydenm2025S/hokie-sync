import { FC, useState, useMemo } from 'react';
import { Section, SelectedClass } from '../types';
import coursesJson from '../data/courses_fixed.json';

interface CourseSelectionProps {
  termCode: string;                // e.g. "202509"
  selectedClasses: SelectedClass[];
  setSelectedClasses: (cs: SelectedClass[]) => void;
}

export const CourseSelection: FC<CourseSelectionProps> = ({
  termCode, selectedClasses, setSelectedClasses
}) => {
  const [search, setSearch] = useState('');

  // 1) flatten raw → Section (with meetings[])
  const allSections: Section[] = useMemo(() => {
    const termObj = (coursesJson as any)[termCode] || {};
    return Object.values(termObj as Record<string, any[]>)
      .flat()
      .map((raw: any) => ({
        id:    raw.CRN,
        code:  raw.Course,
        title: raw.Title,
        meetings: raw.meetings,    // now an array
      }));
  }, [termCode]);

  // 2) group by course code
  const classesMap = useMemo(() => {
    const m = new Map<string, Section[]>();
    allSections.forEach(sec => {
      if (!m.has(sec.code)) m.set(sec.code, []);
      m.get(sec.code)!.push(sec);
    });
    return m;
  }, [allSections]);

  // 3) list for search
  const uniqueClasses = useMemo(
    () => Array.from(classesMap.entries()).map(([code, secs]) => ({
      code,
      title: secs[0].title
    })),
    [classesMap]
  );

  // 4) filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? uniqueClasses.filter(
          c => c.code.toLowerCase().includes(q)
            || c.title.toLowerCase().includes(q)
        )
      : [];
  }, [search, uniqueClasses]);

  const addClass = (code: string) => {
    if (!selectedClasses.find(c => c.code === code)) {
      const secs = classesMap.get(code)!;
      setSelectedClasses([
        ...selectedClasses,
        {
          code,
          title: secs[0].title,
          sections: secs,
          selectedCRN: 'N/A'
        }
      ]);
    }
  };

  const removeClass = (code: string) =>
    setSelectedClasses(selectedClasses.filter(c => c.code !== code));

  const updateCRN = (code: string, crn: string) =>
    setSelectedClasses(selectedClasses.map(c =>
      c.code === code ? { ...c, selectedCRN: crn } : c
    ));

  return (
    <div className="mb-4">
      <h2 className="font-semibold mb-2">Search Classes</h2>
      <input
        type="text"
        className="border rounded p-1 w-full mb-2"
        placeholder="Type course code or title…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {search.trim() && (
        <div className="max-h-48 overflow-y-auto mb-4">
          {filtered.map(c => (
            <button
              key={c.code}
              onClick={() => addClass(c.code)}
              className="block w-full p-2 text-left hover:bg-gray-100"
            >
              <strong>{c.code}</strong> — {c.title}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-red-500">No matches.</p>
          )}
        </div>
      )}

      {selectedClasses.length > 0 && (
        <div className="overflow-auto">
          <h3 className="font-semibold mb-2">Selected Classes</h3>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Course</th>
                <th className="border p-2">Title</th>
                <th className="border p-2">CRN</th>
                <th className="border p-2">Remove</th>
              </tr>
            </thead>
            <tbody>
              {selectedClasses.map(cl => (
                <tr key={cl.code} className="hover:bg-gray-100">
                  <td className="border p-2">{cl.code}</td>
                  <td className="border p-2">{cl.title}</td>
                  <td className="border p-2">
                    <select
                      className="border rounded p-1 w-full"
                      value={cl.selectedCRN}
                      onChange={e => updateCRN(cl.code, e.target.value)}
                    >
                      <option value="N/A">N/A</option>
                      {cl.sections.map(sec => {
                        const primary = sec.meetings[0];
                        return (
                          <option key={sec.id} value={sec.id}>
                            {sec.id} — {primary.days.join('')}
                            {` ${primary.startTime}-${primary.endTime}`}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => removeClass(cl.code)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
