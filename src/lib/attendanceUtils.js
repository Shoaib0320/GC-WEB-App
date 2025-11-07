// import Holiday from "@/Models/Holiday";
// import WeeklyOff from "@/Models/WeeklyOff";
// import Shift from "@/Models/Shift";

// /**
//  * Check if today is a holiday
//  */
// export async function isHoliday(date = new Date()) {
//   const targetDate = new Date(date);
//   targetDate.setHours(0, 0, 0, 0);
  
//   const nextDay = new Date(targetDate);
//   nextDay.setDate(nextDay.getDate() + 1);

//   const holiday = await Holiday.findOne({
//     $or: [
//       // Exact date match
//       { 
//         date: { 
//           $gte: targetDate, 
//           $lt: nextDay 
//         } 
//       },
//       // Recurring holidays (same month and day)
//       {
//         isRecurring: true,
//         $expr: {
//           $and: [
//             { $eq: [{ $month: "$date" }, targetDate.getMonth() + 1] },
//             { $eq: [{ $dayOfMonth: "$date" }, targetDate.getDate()] }
//           ]
//         }
//       }
//     ],
//     isActive: true
//   });

//   return holiday;
// }

// /**
//  * Check if today is weekly off
//  */
// export async function isWeeklyOff(date = new Date()) {
//   const dayNames = [
//     "sunday", "monday", "tuesday", "wednesday", 
//     "thursday", "friday", "saturday"
//   ];
//   const todayName = dayNames[date.getDay()];

//   const weeklyOff = await WeeklyOff.findOne({
//     day: todayName,
//     isActive: true
//   });

//   return weeklyOff;
// }

// /**
//  * Check if shift is assigned for today
//  */
// export async function isShiftDay(shiftId, date = new Date()) {
//   const shift = await Shift.findById(shiftId);
//   if (!shift) return false;

//   const dayNames = [
//     "sunday", "monday", "tuesday", "wednesday", 
//     "thursday", "friday", "saturday"
//   ];
//   const todayName = dayNames[date.getDay()];

//   return shift.days.includes(todayName);
// }

// /**
//  * Parse time string to Date object
//  */
// export function parseShiftDateTime(baseDate, timeStr) {
//   const [hh, mm] = timeStr.split(":").map(Number);
//   const dt = new Date(baseDate);
//   dt.setHours(hh, mm, 0, 0);
//   return dt;
// }

// /**
//  * Calculate time difference in minutes
//  */
// export function getTimeDifferenceInMinutes(startTime, endTime) {
//   return Math.floor((endTime - startTime) / (1000 * 60));
// }

// /**
//  * Get today's date range
//  */
// export function getTodayDateRange() {
//   const now = new Date();
//   const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const todayEnd = new Date(todayStart);
//   todayEnd.setDate(todayEnd.getDate() + 1);
  
//   return { todayStart, todayEnd, now };
// }



import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Shift from "@/Models/Shift";

/**
 * Parse time string to Date object with proper timezone handling
 */
export function parseShiftDateTime(baseDate, timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    throw new Error('Invalid time string');
  }
  
  const [hh, mm] = timeStr.split(":").map(Number);
  
  // Create new date object from base date
  const dt = new Date(baseDate);
  dt.setHours(hh, mm, 0, 0); // Set hours and minutes
  
  return dt;
}

/**
 * Calculate time difference in minutes with proper validation
 */
export function getTimeDifferenceInMinutes(startTime, endTime) {
  if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
    throw new Error('Invalid date objects');
  }
  
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60))); // Ensure non-negative
}

/**
 * Get today's date range with proper timezone handling
 */
export function getTodayDateRange() {
  const now = new Date();
  
  // Create today start (00:00:00)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  // Create today end (23:59:59.999)
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  todayEnd.setMilliseconds(-1);
  
  return { todayStart, todayEnd, now };
}

/**
 * Check if today is holiday
 */
export async function isHoliday(date = new Date()) {
  try {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const holiday = await Holiday.findOne({
      $or: [
        { 
          date: { 
            $gte: targetDate, 
            $lt: nextDay 
          } 
        },
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
  } catch (error) {
    console.error('Error checking holiday:', error);
    return null;
  }
}

/**
 * Check if today is weekly off
 */
export async function isWeeklyOff(date = new Date()) {
  try {
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
  } catch (error) {
    console.error('Error checking weekly off:', error);
    return null;
  }
}

/**
 * Check if shift is assigned for today
 */
// export async function isShiftDay(shiftId, date = new Date()) {
//   try {
//     const shift = await Shift.findById(shiftId);
//     if (!shift || !shift.days || !Array.isArray(shift.days)) return false;

//     const dayNames = [
//       "sunday", "monday", "tuesday", "wednesday", 
//       "thursday", "friday", "saturday"
//     ];
//     const todayName = dayNames[date.getDay()];

//     return shift.days.includes(todayName);
//   } catch (error) {
//     console.error('Error checking shift day:', error);
//     return false;
//   }
// }

export async function isShiftDay(shiftId, date = new Date()) {
  try {
    const shift = await Shift.findById(shiftId);
    if (!shift || !shift.days || !Array.isArray(shift.days)) {
      console.log('❌ Shift not found or invalid days array:', {
        shiftId,
        hasShift: !!shift,
        days: shift?.days
      });
      return false;
    }

    const dayNames = [
      "sunday", "monday", "tuesday", "wednesday", 
      "thursday", "friday", "saturday"
    ];
    const todayName = dayNames[date.getDay()];
    
    // Convert today's full name to short format for comparison
    const shortDayMap = {
      "sunday": "Sun",
      "monday": "Mon", 
      "tuesday": "Tue",
      "wednesday": "Wed",
      "thursday": "Thu",
      "friday": "Fri",
      "saturday": "Sat"
    };
    
    const todayShortName = shortDayMap[todayName];
    
    // Also check for full names in case some shifts use full names
    const isMatch = shift.days.includes(todayShortName) || 
                    shift.days.includes(todayName);
    
    console.log('🔍 Shift Day Check:', {
      shiftId,
      shiftName: shift.name,
      shiftDays: shift.days,
      todayFullName: todayName,
      todayShortName: todayShortName,
      isMatch,
      currentDay: date.getDay(),
      currentDate: date.toLocaleDateString('en-IN')
    });

    return isMatch;
    
  } catch (error) {
    console.error('❌ Error checking shift day:', error);
    return false;
  }
}