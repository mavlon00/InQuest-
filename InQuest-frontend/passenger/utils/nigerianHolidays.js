export const nigerianHolidays2026 = [
  { date: '2026-01-01', name: "New Year's Day", approximate: false },
  { date: '2026-03-18', name: 'Eid el-Fitr', approximate: true },
  { date: '2026-04-03', name: 'Good Friday', approximate: false },
  { date: '2026-04-06', name: 'Easter Monday', approximate: false },
  { date: '2026-05-01', name: 'Workers Day', approximate: false },
  { date: '2026-05-25', name: 'Eid el-Kabir', approximate: true },
  { date: '2026-06-12', name: 'Democracy Day', approximate: false },
  { date: '2026-08-15', name: 'Assumption Day', approximate: false },
  { date: '2026-10-01', name: 'Independence Day', approximate: false },
  { date: '2026-10-24', name: 'Eid el-Mawlid', approximate: true },
  { date: '2026-12-25', name: 'Christmas Day', approximate: false },
  { date: '2026-12-26', name: 'Boxing Day', approximate: false },
];

/**
 * Checks if a specific date string is a holiday
 * @param {string} dateString - Format 'YYYY-MM-DD'
 * @returns {object|null} The holiday object or null
 */
export function getHolidayOnDate(dateString) {
  return nigerianHolidays2026.find(h => h.date === dateString) || null;
}

/**
 * Returns a list of upcoming holidays that fall on the specified days of the week.
 * @param {number[]} daysOfWeek - Array of days [1=Mon, 2=Tue, ..., 7=Sun] (0=Sun in native JS, but assume 1-7 ISO)
 * @param {string|Date} startDate - Format 'YYYY-MM-DD' or Date object
 * @param {number} rangeDays - How many days ahead to check (default 90)
 * @returns {object[]} Array of matching holiday objects
 */
export function getUpcomingHolidaysOnDays(daysOfWeek, startDate, rangeDays = 90) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + rangeDays);

  return nigerianHolidays2026.filter(holiday => {
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);

    // Skip if holiday is out of the date range
    if (holidayDate < start || holidayDate > end) {
      return false;
    }

    // JS getDay() returns 0 for Sunday, 1 for Monday...
    // The prompt uses [1,2,3,4,5] so let's assume Monday=1, Sunday=7 mapping.
    let dayOfWeek = holidayDate.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;

    return daysOfWeek.includes(dayOfWeek);
  });
}
