// lib/attendanceUtils.js
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Shift from "@/Models/Shift";

const DEFAULT_TZ = "Asia/Karachi";

/**
 * Parse time string to Date object relative to baseDate (which should already be tz-aware)
 */
export function parseShiftDateTime(baseDate, timeStr) {
  if (!timeStr || typeof timeStr !== "string") {
    throw new Error("Invalid time string");
  }

  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

/**
 * Calculate time difference in minutes (end - start)
 */
export function getTimeDifferenceInMinutes(startTime, endTime) {
  if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
    throw new Error("Invalid date objects");
  }
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Get today's date range in Asia/Karachi timezone
 */
export function getTodayDateRange(timezone = DEFAULT_TZ) {
  // Convert system UTC -> target timezone
  const nowTz = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));

  const todayStart = new Date(nowTz);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  todayEnd.setMilliseconds(-1);

  return { todayStart, todayEnd, now: nowTz };
}

/**
 * Check if date is a holiday
 */
export async function isHoliday(date = new Date()) {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const holiday = await Holiday.findOne({
      $or: [
        { date: { $gte: targetDate, $lt: nextDay } },
        {
          isRecurring: true,
          $expr: {
            $and: [
              { $eq: [{ $month: "$date" }, targetDate.getMonth() + 1] },
              { $eq: [{ $dayOfMonth: "$date" }, targetDate.getDate()] },
            ],
          },
        },
      ],
      isActive: true,
    });

    return holiday;
  } catch (error) {
    console.error("Error checking holiday:", error);
    return null;
  }
}

/**
 * Check if today is a weekly off
 */
export async function isWeeklyOff(date = new Date()) {
  try {
    const dayNames = [
      "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
    ];
    const todayName = dayNames[date.getDay()];

    const weeklyOff = await WeeklyOff.findOne({
      day: todayName,
      isActive: true,
    });

    return weeklyOff;
  } catch (error) {
    console.error("Error checking weekly off:", error);
    return null;
  }
}

/**
 * Check if the shift applies to today's day
 */
export async function isShiftDay(shiftId, date = new Date()) {
  try {
    const shift = await Shift.findById(shiftId);
    if (!shift || !Array.isArray(shift.days)) {
      console.log("❌ Shift not found or invalid days:", shiftId);
      return false;
    }

    const dayNames = [
      "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
    ];
    const shortDayMap = {
      sunday: "Sun",
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
    };

    const todayName = dayNames[date.getDay()];
    const todayShort = shortDayMap[todayName];

    const isMatch = shift.days.includes(todayShort) || shift.days.includes(todayName);

    console.log("🔍 Shift Day Check:", {
      shift: shift.name,
      days: shift.days,
      today: todayShort,
      match: isMatch,
    });

    return isMatch;
  } catch (error) {
    console.error("Error checking shift day:", error);
    return false;
  }
}
