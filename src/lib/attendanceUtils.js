import Holiday from "@/models/Holiday";
import WeeklyOff from "@/models/WeeklyOff";
import Shift from "@/models/Shift";

/**
 * Check if today is a holiday
 */
export async function isHoliday(date = new Date()) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const holiday = await Holiday.findOne({
    $or: [
      // Exact date match
      { 
        date: { 
          $gte: targetDate, 
          $lt: nextDay 
        } 
      },
      // Recurring holidays (same month and day)
      {
        isRecurring: true,
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, targetDate.getMonth() + 1] },
            { $eq: [{ $dayOfMonth: "$date" }, targetDate.getDate()] }
          ]
        }
      }
    ],
    isActive: true
  });

  return holiday;
}

/**
 * Check if today is weekly off
 */
export async function isWeeklyOff(date = new Date()) {
  const dayNames = [
    "sunday", "monday", "tuesday", "wednesday", 
    "thursday", "friday", "saturday"
  ];
  const todayName = dayNames[date.getDay()];

  const weeklyOff = await WeeklyOff.findOne({
    day: todayName,
    isActive: true
  });

  return weeklyOff;
}

/**
 * Check if shift is assigned for today
 */
export async function isShiftDay(shiftId, date = new Date()) {
  const shift = await Shift.findById(shiftId);
  if (!shift) return false;

  const dayNames = [
    "sunday", "monday", "tuesday", "wednesday", 
    "thursday", "friday", "saturday"
  ];
  const todayName = dayNames[date.getDay()];

  return shift.days.includes(todayName);
}

/**
 * Parse time string to Date object
 */
export function parseShiftDateTime(baseDate, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

/**
 * Calculate time difference in minutes
 */
export function getTimeDifferenceInMinutes(startTime, endTime) {
  return Math.floor((endTime - startTime) / (1000 * 60));
}

/**
 * Get today's date range
 */
export function getTodayDateRange() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  return { todayStart, todayEnd, now };
}