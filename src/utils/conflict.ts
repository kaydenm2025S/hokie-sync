export interface ClassSection {
    crn: string;
    courseName: string;
    courseNumber: string;
    days: string[]; // ["M", "W", "F"]
    startTime: string; // "12:30PM"
    endTime: string;   // "1:45PM"
  }
  
  export const checkConflict = (
    newSection: ClassSection,
    existingSections: ClassSection[]
  ): boolean => {
    const timeToMinutes = (time: string) => {
      const [h, mPart] = time.split(":");
      const m = parseInt(mPart.slice(0, 2));
      const period = mPart.slice(2);
      let hours = parseInt(h);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + m;
    };
  
    const newStart = timeToMinutes(newSection.startTime);
    const newEnd = timeToMinutes(newSection.endTime);
  
    for (const section of existingSections) {
      if (section.days.some((day) => newSection.days.includes(day))) {
        const existingStart = timeToMinutes(section.startTime);
        const existingEnd = timeToMinutes(section.endTime);
        if (Math.max(newStart, existingStart) < Math.min(newEnd, existingEnd)) {
          return true; // Conflict
        }
      }
    }  
    return false;
  };
  