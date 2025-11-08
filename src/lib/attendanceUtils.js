// // lib/attendanceUtils.js
// import Holiday from "@/Models/Holiday";
// import WeeklyOff from "@/Models/WeeklyOff";
// import Shift from "@/Models/Shift";

// const DEFAULT_TZ = "Asia/Karachi";

// /**
//  * Parse time string to Date object relative to baseDate (which should already be tz-aware)
//  */
// export function parseShiftDateTime(baseDate, timeStr) {
//   if (!timeStr || typeof timeStr !== "string") {
//     throw new Error("Invalid time string");
//   }

//   const [hh, mm] = timeStr.split(":").map(Number);
//   const dt = new Date(baseDate);
//   dt.setHours(hh, mm, 0, 0);
//   return dt;
// }

// /**
//  * Calculate time difference in minutes (end - start)
//  */
// export function getTimeDifferenceInMinutes(startTime, endTime) {
//   if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
//     throw new Error("Invalid date objects");
//   }
//   const diffMs = endTime.getTime() - startTime.getTime();
//   return Math.floor(diffMs / (1000 * 60));
// }

// /**
//  * Get today's date range in Asia/Karachi timezone
//  */
// export function getTodayDateRange(timezone = DEFAULT_TZ) {
//   // Convert system UTC -> target timezone
//   const nowTz = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));

//   const todayStart = new Date(nowTz);
//   todayStart.setHours(0, 0, 0, 0);

//   const todayEnd = new Date(todayStart);
//   todayEnd.setDate(todayEnd.getDate() + 1);
//   todayEnd.setMilliseconds(-1);

//   return { todayStart, todayEnd, now: nowTz };
// }

// /**
//  * Check if date is a holiday
//  */
// export async function isHoliday(date = new Date()) {
//   try {
//     const targetDate = new Date(date);
//     targetDate.setHours(0, 0, 0, 0);

//     const nextDay = new Date(targetDate);
//     nextDay.setDate(nextDay.getDate() + 1);

//     const holiday = await Holiday.findOne({
//       $or: [
//         { date: { $gte: targetDate, $lt: nextDay } },
//         {
//           isRecurring: true,
//           $expr: {
//             $and: [
//               { $eq: [{ $month: "$date" }, targetDate.getMonth() + 1] },
//               { $eq: [{ $dayOfMonth: "$date" }, targetDate.getDate()] },
//             ],
//           },
//         },
//       ],
//       isActive: true,
//     });

//     return holiday;
//   } catch (error) {
//     console.error("Error checking holiday:", error);
//     return null;
//   }
// }

// /**
//  * Check if today is a weekly off
//  */
// export async function isWeeklyOff(date = new Date()) {
//   try {
//     const dayNames = [
//       "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
//     ];
//     const todayName = dayNames[date.getDay()];

//     const weeklyOff = await WeeklyOff.findOne({
//       day: todayName,
//       isActive: true,
//     });

//     return weeklyOff;
//   } catch (error) {
//     console.error("Error checking weekly off:", error);
//     return null;
//   }
// }

// /**
//  * Check if the shift applies to today's day
//  */
// export async function isShiftDay(shiftId, date = new Date()) {
//   try {
//     const shift = await Shift.findById(shiftId);
//     if (!shift || !Array.isArray(shift.days)) {
//       console.log("❌ Shift not found or invalid days:", shiftId);
//       return false;
//     }

//     const dayNames = [
//       "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
//     ];
//     const shortDayMap = {
//       sunday: "Sun",
//       monday: "Mon",
//       tuesday: "Tue",
//       wednesday: "Wed",
//       thursday: "Thu",
//       friday: "Fri",
//       saturday: "Sat",
//     };

//     const todayName = dayNames[date.getDay()];
//     const todayShort = shortDayMap[todayName];

//     const isMatch = shift.days.includes(todayShort) || shift.days.includes(todayName);

//     console.log("🔍 Shift Day Check:", {
//       shift: shift.name,
//       days: shift.days,
//       today: todayShort,
//       match: isMatch,
//     });

//     return isMatch;
//   } catch (error) {
//     console.error("Error checking shift day:", error);
//     return false;
//   }
// }



// lib/attendanceUtils.js
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Shift from "@/Models/Shift";
import Attendance from "@/Models/Attendance";

const DEFAULT_TZ = "Asia/Karachi";

/**
 * Parse time string to Date object relative to baseDate
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

/**
 * Check if shift has ended - IMPROVED VERSION with timezone support
 */
export function hasShiftEnded(shiftEndTime, currentTime, timezone = DEFAULT_TZ) {
  if (!shiftEndTime) return false;
  
  try {
    const [endHours, endMinutes] = shiftEndTime.split(':').map(Number);
    
    // Convert current time to target timezone
    const currentInTz = new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));
    const shiftEnd = new Date(currentInTz);
    shiftEnd.setHours(endHours, endMinutes, 0, 0);
    
    const hasEnded = currentInTz > shiftEnd;
    
    console.log(`⏰ Shift End Check:`, {
      shiftEndTime,
      currentTime: currentInTz.toLocaleTimeString(),
      shiftEnd: shiftEnd.toLocaleTimeString(),
      hasEnded
    });
    
    return hasEnded;
  } catch (error) {
    console.error('Error in hasShiftEnded:', error);
    return false;
  }
}

/**
 * Check if user/agent already has attendance for the date - COMPREHENSIVE CHECK
 */
export async function hasExistingAttendance(userId, agentId, date) {
  try {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const query = {
      $or: [
        { date: { $gte: dateStart, $lt: dateEnd } },
        { createdAt: { $gte: dateStart, $lt: dateEnd } }
      ]
    };

    if (userId) {
      query.user = userId;
    } else if (agentId) {
      query.agent = agentId;
    }

    const existingAttendance = await Attendance.findOne(query)
      .populate('user', 'firstName lastName')
      .populate('agent', 'agentName');

    if (existingAttendance) {
      const name = existingAttendance.user 
        ? `${existingAttendance.user.firstName} ${existingAttendance.user.lastName}`
        : existingAttendance.agent?.agentName || 'Unknown';
      
      console.log(`📋 Existing Attendance Found: ${name} - ${existingAttendance.status} - ${existingAttendance.createdAt}`);
      return {
        exists: true,
        record: existingAttendance,
        status: existingAttendance.status,
        name: name
      };
    }

    return { exists: false, record: null };
  } catch (error) {
    console.error('Error checking existing attendance:', error);
    return { exists: false, record: null, error: error.message };
  }
}

/**
 * Check if user should be marked absent - IMPROVED VERSION
 */
export async function shouldMarkAbsent(user, holiday, weeklyOff, currentTime, timezone = DEFAULT_TZ) {
  // If holiday or weekly off, don't mark as absent
  if (holiday || weeklyOff) {
    console.log(`🎯 Skip Absent: Holiday/Weekly Off - ${user.firstName || user.agentName}`);
    return false;
  }
  
  // If user has no shift, mark as absent
  if (!user.shift) {
    console.log(`🎯 Mark Absent: No Shift - ${user.firstName || user.agentName}`);
    return true;
  }
  
  // Check if today is working day for this shift
  const isWorking = await isShiftDay(user.shift._id, currentTime);
  if (!isWorking) {
    console.log(`🎯 Skip Absent: Not Working Day - ${user.firstName || user.agentName}`);
    return false;
  }
  
  // Check if shift has ended
  const shiftEnded = hasShiftEnded(user.shift.endTime, currentTime, timezone);
  
  if (shiftEnded) {
    console.log(`🎯 Mark Absent: Shift Ended - ${user.firstName || user.agentName}`);
  } else {
    console.log(`🎯 Skip Absent: Shift Not Ended - ${user.firstName || user.agentName}`);
  }
  
  return shiftEnded;
}

/**
 * Get all existing attendance for a date range
 */
export async function getExistingAttendanceForDate(date, userType = "all") {
  try {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const query = {
      $or: [
        { date: { $gte: dateStart, $lt: dateEnd } },
        { createdAt: { $gte: dateStart, $lt: dateEnd } }
      ]
    };

    // Filter by user type
    if (userType === "user") {
      query.user = { $exists: true, $ne: null };
    } else if (userType === "agent") {
      query.agent = { $exists: true, $ne: null };
    }

    const existingAttendance = await Attendance.find(query)
      .populate('user', 'firstName lastName email')
      .populate('agent', 'agentName email')
      .populate('shift', 'name startTime endTime')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: existingAttendance,
      count: existingAttendance.length
    };
  } catch (error) {
    console.error('Error getting existing attendance:', error);
    return {
      success: false,
      data: [],
      count: 0,
      error: error.message
    };
  }
}

/**
 * Validate if attendance can be created (duplicate prevention)
 */
export async function canCreateAttendance(userId, agentId, date) {
  try {
    const existingCheck = await hasExistingAttendance(userId, agentId, date);
    
    if (existingCheck.exists) {
      return {
        canCreate: false,
        reason: `Attendance already exists with status: ${existingCheck.status}`,
        existingRecord: existingCheck.record
      };
    }

    return {
      canCreate: true,
      reason: 'No existing attendance found'
    };
  } catch (error) {
    return {
      canCreate: false,
      reason: `Error checking existing attendance: ${error.message}`
    };
  }
}

/**
 * Get users/agents without attendance for a specific date
 */
export async function getUsersWithoutAttendance(activeUsers, activeAgents, date, userType = "all") {
  try {
    const existingResult = await getExistingAttendanceForDate(date, userType);
    
    if (!existingResult.success) {
      throw new Error(existingResult.error);
    }

    const existingAttendance = existingResult.data;
    const existingUserIds = existingAttendance
      .filter(a => a.user)
      .map(a => a.user._id.toString());
    
    const existingAgentIds = existingAttendance
      .filter(a => a.agent)
      .map(a => a.agent._id.toString());

    let usersWithout = [];
    let agentsWithout = [];

    if (userType === "all" || userType === "user") {
      usersWithout = activeUsers.filter(
        user => !existingUserIds.includes(user._id.toString())
      );
    }

    if (userType === "all" || userType === "agent") {
      agentsWithout = activeAgents.filter(
        agent => !existingAgentIds.includes(agent._id.toString())
      );
    }

    return {
      success: true,
      data: {
        usersWithoutAttendance: usersWithout,
        agentsWithoutAttendance: agentsWithout,
        existingCount: existingAttendance.length,
        usersWithoutCount: usersWithout.length,
        agentsWithoutCount: agentsWithout.length
      }
    };
  } catch (error) {
    console.error('Error getting users without attendance:', error);
    return {
      success: false,
      data: {
        usersWithoutAttendance: [],
        agentsWithoutAttendance: [],
        existingCount: 0,
        usersWithoutCount: 0,
        agentsWithoutCount: 0
      },
      error: error.message
    };
  }
}

/**
 * Create attendance record with duplicate prevention
 */
export async function createAttendanceRecord(attendanceData, options = {}) {
  try {
    const { checkExisting = true, throwOnDuplicate = true } = options;
    
    // Check for existing attendance if enabled
    if (checkExisting) {
      const canCreate = await canCreateAttendance(
        attendanceData.user, 
        attendanceData.agent, 
        attendanceData.date || new Date()
      );
      
      if (!canCreate.canCreate) {
        if (throwOnDuplicate) {
          throw new Error(`Cannot create attendance: ${canCreate.reason}`);
        }
        return {
          success: false,
          created: false,
          reason: canCreate.reason,
          existingRecord: canCreate.existingRecord
        };
      }
    }

    // Create attendance record
    const attendance = await Attendance.create(attendanceData);
    
    return {
      success: true,
      created: true,
      record: attendance,
      message: 'Attendance record created successfully'
    };
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return {
      success: false,
      created: false,
      error: error.message
    };
  }
}

/**
 * Batch create attendance records with duplicate prevention
 */
export async function batchCreateAttendanceRecords(attendanceDocs, options = {}) {
  try {
    const { checkExisting = true, ordered = false } = options;
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };

    // If checkExisting is enabled, filter out duplicates
    let docsToCreate = attendanceDocs;
    
    if (checkExisting) {
      const filteredDocs = [];
      
      for (const doc of attendanceDocs) {
        const canCreate = await canCreateAttendance(doc.user, doc.agent, doc.date);
        
        if (canCreate.canCreate) {
          filteredDocs.push(doc);
        } else {
          results.skipped.push({
            doc,
            reason: canCreate.reason,
            existingRecord: canCreate.existingRecord
          });
        }
      }
      
      docsToCreate = filteredDocs;
    }

    // Create records
    if (docsToCreate.length > 0) {
      try {
        const createdRecords = await Attendance.insertMany(docsToCreate, { ordered });
        results.successful = createdRecords;
      } catch (insertError) {
        if (insertError.writeErrors) {
          results.successful = insertError.insertedCount || 0;
          insertError.writeErrors.forEach(error => {
            results.failed.push({
              error: error.errmsg,
              code: error.code,
              doc: attendanceDocs[error.index]
            });
          });
        } else {
          throw insertError;
        }
      }
    }

    return {
      success: true,
      ...results,
      summary: {
        totalRequested: attendanceDocs.length,
        totalCreated: results.successful.length,
        totalFailed: results.failed.length,
        totalSkipped: results.skipped.length
      }
    };
  } catch (error) {
    console.error('Error in batch create attendance:', error);
    return {
      success: false,
      successful: [],
      failed: [],
      skipped: [],
      error: error.message
    };
  }
}

export function hasShiftEndedSmart(shiftEndTime, processDate, timezone = DEFAULT_TZ) {
  if (!shiftEndTime) return true; // No shift = consider ended
  
  try {
    const [endHours, endMinutes] = shiftEndTime.split(':').map(Number);
    const processDateInTz = new Date(processDate.toLocaleString("en-US", { timeZone: timezone }));
    const shiftEnd = new Date(processDateInTz);
    shiftEnd.setHours(endHours, endMinutes, 0, 0);
    
    const today = new Date();
    const isToday = processDate.toDateString() === today.toDateString();
    const isPastDate = processDate < today;
    
    let hasEnded;
    
    if (isPastDate) {
      // 🔥 PAST DATES: Shift is always considered ended
      hasEnded = true;
    } else if (isToday) {
      // 🔥 TODAY: Check current time vs shift end time
      const currentInTz = new Date(today.toLocaleString("en-US", { timeZone: timezone }));
      hasEnded = currentInTz > shiftEnd;
    } else {
      // 🔥 FUTURE DATES: Shift hasn't ended yet
      hasEnded = false;
    }
    
    console.log(`🎯 SMART Shift Check:`, {
      shiftEndTime,
      processDate: processDateInTz.toLocaleDateString(),
      shiftEnd: shiftEnd.toLocaleTimeString(),
      isPastDate,
      isToday,
      hasEnded
    });
    
    return hasEnded;
    
  } catch (error) {
    console.error('Error in hasShiftEndedSmart:', error);
    return true; // Default to ended for safety
  }
}

/**
 * Smart Auto Attendance Logic - RECOMMENDED
 */
export async function shouldMarkAbsentSmart(user, holiday, weeklyOff, processDate, timezone = DEFAULT_TZ) {
  const userName = user.firstName || user.agentName;
  
  // 1. Check Holiday/Weekly Off First
  if (holiday || weeklyOff) {
    console.log(`🎯 [SMART] Skip: Holiday/Weekly Off - ${userName}`);
    return false;
  }
  
  // 2. Check if No Shift
  if (!user.shift) {
    console.log(`🎯 [SMART] Mark Absent: No Shift - ${userName}`);
    return true;
  }
  
  // 3. Check Working Day
  const isWorking = await isShiftDay(user.shift._id, processDate);
  if (!isWorking) {
    console.log(`🎯 [SMART] Skip: Not Working Day - ${userName}`);
    return false;
  }
  
  // 4. Smart Shift End Check
  const shiftEnded = hasShiftEndedSmart(user.shift.endTime, processDate, timezone);
  
  if (shiftEnded) {
    console.log(`🎯 [SMART] Mark Absent: Shift Ended - ${userName}`);
    return true;
  } else {
    console.log(`🎯 [SMART] Skip: Shift Not Ended - ${userName}`);
    return false;
  }
}