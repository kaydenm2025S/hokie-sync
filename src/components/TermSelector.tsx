import { FC } from 'react';

interface TermSelectorProps {
  term: string;
  setTerm: (term: string) => void;
}

export const TermSelector: FC<TermSelectorProps> = ({ term, setTerm }) => {
  const terms = ['Spring 2025', 'Summer 2025', 'Fall 2025'];

  return (
    <div className="mb-4">
      <label className="font-semibold">Select Term:</label>
      <select value={term} onChange={(e) => setTerm(e.target.value)} className="border rounded p-1 ml-2">
        {terms.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
};
