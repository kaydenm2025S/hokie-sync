// /src/types/index.ts

export interface Meeting {
  days: string[];        // e.g. ["M","W","F"]
  startTime: string;     // e.g. "09:00AM"
  endTime: string;       // e.g. "10:15AM"
  location: string;      // e.g. "DER 3081"
}

export interface Section {
  id: string;            // CRN, e.g. "83234"
  code: string;          // e.g. "CMDA-2005"
  title: string;         // e.g. "Integrated Quantitative Sci"
  meetings: Meeting[];   // one or more meeting‐times
}

export interface SelectedClass {
  code: string;          // e.g. "CMDA-2005"
  title: string;         // same as above
  sections: Section[];   // all CRNs for that class
  selectedCRN: string;   // "N/A" or the CRN they pick
}
