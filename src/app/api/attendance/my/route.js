// // app/api/attendance/my/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
// import Holiday from "@/Models/Holiday";
// import WeeklyOff from "@/Models/WeeklyOff";
// import Shift from "@/Models/Shift";
// import Agent from "@/Models/Agent";
// import User from "@/Models/User";

// /** ---------- Pakistan Time Utilities ---------- **/

// // Convert to Pakistan Time (Asia/Karachi)
// function toPakistanDate(date) {
//   return new Date(
//     new Date(date).toLocaleString("en-US", { timeZone: "Asia/Karachi" })
//   );
// }

// // Stable Key in Pakistan Time (YYYY-MM-DD)
// function toKeyPKT(date) {
//   const d = toPakistanDate(date);
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// }

// // Get dates between start and end (inclusive)
// function getDatesBetween(startDate, endDate) {
//   const dates = [];
//   const current = new Date(startDate);
//   const end = new Date(endDate);
  
//   // Reset time to 00:00:00
//   current.setHours(0, 0, 0, 0);
//   end.setHours(0, 0, 0, 0);
  
//   while (current <= end) {
//     dates.push(new Date(current));
//     current.setDate(current.getDate() + 1);
//   }
  
//   return dates;
// }

// // Get first attendance date from DB
// async function getFirstAttendanceDate(userId, userType) {
//   const queryField = userType === "agent" ? "agent" : "user";
  
//   const firstRecord = await Attendance.findOne({ [queryField]: userId })
//     .sort({ date: 1, createdAt: 1, checkInTime: 1 })
//     .select('date createdAt checkInTime');
    
//   if (firstRecord) {
//     const date = firstRecord.date || firstRecord.createdAt || firstRecord.checkInTime;
//     return toPakistanDate(date);
//   }
  
//   // If no attendance record, get user creation date
//   if (userType === "agent") {
//     const agent = await Agent.findById(userId).select('createdAt');
//     return agent?.createdAt ? toPakistanDate(agent.createdAt) : toPakistanDate(new Date());
//   } else {
//     const user = await User.findById(userId).select('createdAt');
//     return user?.createdAt ? toPakistanDate(user.createdAt) : toPakistanDate(new Date());
//   }
// }

// // Get day name in lowercase
// function getDayName(date) {
//   return toPakistanDate(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
// }

// // Normalize status strings
// function normalizeStatus(s) {
//   if (!s) return "absent";
//   const str = String(s).toLowerCase();
  
//   // Present categories
//   if (["present"].includes(str)) return "present";
//   if (["late"].includes(str)) return "late";
//   if (["halfday", "half_day", "half-day", "half day"].includes(str)) return "half_day";
  
//   // Leave categories
//   if (["approved_leave", "approved leave", "leave_approved", "leave approved"].includes(str)) return "approved_leave";
//   if (["pending_leave", "pending leave", "leave_pending", "leave pending"].includes(str)) return "pending_leave";
//   if (["leave"].includes(str)) return "approved_leave";
  
//   // Non-working days
//   if (["holiday"].includes(str)) return "holiday";
//   if (["weekly_off", "weeklyoff", "weekly-off", "weekly off"].includes(str)) return "weekly_off";
  
//   // Absent
//   if (["absent"].includes(str)) return "absent";
  
//   return "present";
// }

// // Check if today's shift has started
// function isShiftStartedToday(userShiftStartTime) {
//   try {
//     const now = toPakistanDate(new Date());
//     const nowMinutes = now.getHours() * 60 + now.getMinutes();
    
//     if (!userShiftStartTime || userShiftStartTime === "00:00") return true;
    
//     const [shiftHour, shiftMinute] = userShiftStartTime.split(':').map(Number);
//     const shiftStartMinutes = shiftHour * 60 + shiftMinute;
    
//     return nowMinutes >= shiftStartMinutes;
//   } catch (error) {
//     return true;
//   }
// }

// // Check if date is within requested month
// function isDateInMonth(date, year, month) {
//   const dateObj = new Date(date);
//   return dateObj.getFullYear() === year && dateObj.getMonth() + 1 === month;
// }

// /** ---------- Main API ---------- **/

// export async function GET(request) {
//   try {
//     await connectDB();
//     console.log("📅 Attendance Monthly Route Triggered (Pakistan Time)");

//     const authHeader = request.headers.get("authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken(token);
//     if (!decoded) {
//       return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
//     }

//     const userId = getUserIdFromToken(decoded);
//     const userType = decoded.type || "agent";

//     const { searchParams } = new URL(request.url);
//     const month = parseInt(searchParams.get("month"));
//     const year = parseInt(searchParams.get("year"));
//     if (!month || !year) {
//       return NextResponse.json({ success: false, message: "Month and Year are required" }, { status: 400 });
//     }

//     const queryField = userType === "agent" ? "agent" : "user";

//     // Fetch user/agent data
//     let userData, userShiftStartTime;
//     if (userType === "agent") {
//       userData = await Agent.findById(userId)
//         .populate("shift", "startTime endTime name");
//       userShiftStartTime = userData?.shift?.startTime || "09:00";
//     } else {
//       userData = await User.findById(userId)
//         .populate("shift", "startTime endTime name");
//       userShiftStartTime = userData?.shift?.startTime || "09:00";
//     }

//     // Get first attendance date
//     const firstAttendanceDatePK = await getFirstAttendanceDate(userId, userType);
//     console.log(`📅 First Attendance Date: ${firstAttendanceDatePK.toISOString()}`);
    
//     // Get today's date in PKT
//     const todayPK = toPakistanDate(new Date());
//     const todayKey = toKeyPKT(todayPK);
    
//     console.log(`📊 Requested Month: ${month}-${year}`);
//     console.log(`📅 Today: ${todayKey}`);

//     // Calculate date range for this month
//     const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
//     const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    
//     // Calculate actual start date (first attendance date or month start, whichever is later)
//     const actualStartDate = firstAttendanceDatePK > monthStart ? firstAttendanceDatePK : monthStart;
    
//     // Calculate actual end date (today or month end, whichever is earlier)
//     const actualEndDate = todayPK < monthEnd ? todayPK : new Date(monthEnd.getTime() - 1);
    
//     console.log(`📅 Date Range: ${actualStartDate.toISOString()} to ${actualEndDate.toISOString()}`);

//     // Get attendance records for the date range
//     const attends = await Attendance.find({
//       [queryField]: userId,
//       $or: [
//         { date: { $gte: actualStartDate, $lte: actualEndDate } },
//         { checkInTime: { $gte: actualStartDate, $lte: actualEndDate } },
//       ],
//     })
//       .populate("shift", "name startTime endTime")
//       .sort({ date: 1 });

//     console.log(`📊 Found ${attends.length} attendance records in range`);

//     // Map attendance by PKT key
//     const attendanceMap = {};
//     attends.forEach(att => {
//       const source = att.date || att.checkInTime || att.createdAt;
//       if (!source) return;
//       const key = toKeyPKT(source);
      
//       if (!attendanceMap[key]) {
//         attendanceMap[key] = att;
//       }
//     });

//     // Get all dates from first attendance to today (within requested month)
//     const allDatesInRange = getDatesBetween(actualStartDate, actualEndDate);
    
//     // Filter dates to only include those in requested month
//     const filteredDates = allDatesInRange.filter(date => 
//       isDateInMonth(date, year, month)
//     );
    
//     console.log(`📅 Total dates in range: ${filteredDates.length}`);

//     // Check if today's shift has started (only if today is in requested month)
//     const isCurrentMonth = (year === todayPK.getFullYear() && month === todayPK.getMonth() + 1);
//     const todayShiftStarted = isCurrentMonth ? isShiftStartedToday(userShiftStartTime) : true;

//     // Weekly Offs & Holidays
//     const weeklyOffDocs = await WeeklyOff.find({ isActive: true });
//     const weeklyOffSet = new Set(weeklyOffDocs.map(w => w.day.toLowerCase()));

//     const holidayDocs = await Holiday.find({
//       $or: [
//         { date: { $gte: monthStart, $lt: monthEnd } },
//         { isRecurring: true }
//       ],
//       isActive: true
//     });

//     const holidaysSet = new Set();
//     for (const h of holidayDocs) {
//       if (h.isRecurring && h.date) {
//         const recDate = new Date(h.date);
//         const recKey = `${recDate.getMonth() + 1}-${recDate.getDate()}`;
//         holidaysSet.add(recKey);
//       } else if (h.date) {
//         holidaysSet.add(toKeyPKT(h.date));
//       }
//     }

//     /** ---------------- Build Final Data ---------------- **/
//     const tableData = [];
//     let stats = {
//       present: 0,
//       late: 0,
//       half_day: 0,
//       approved_leave: 0,
//       pending_leave: 0,
//       absent: 0,
//       holiday: 0,
//       weeklyOff: 0,
//       totalWorkingDays: 0,
//       totalPresentDays: 0,
//       totalAbsentDays: 0,
//       totalLeaveDays: 0
//     };

//     const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
//     const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

//     // Process each date in chronological order
//     const sortedDates = filteredDates.sort((a, b) => a - b);
    
//     for (const dateObj of sortedDates) {
//       const key = toKeyPKT(dateObj);
//       const isToday = key === todayKey;
      
//       const record = attendanceMap[key];
//       const isHoliday = holidaysSet.has(key) || holidaysSet.has(`${dateObj.getMonth() + 1}-${dateObj.getDate()}`);
//       const isWeeklyOff = weeklyOffSet.has(getDayName(dateObj));
      
//       let status = "absent";
//       let remarks = "";
//       let checkInTime = null;
//       let checkOutTime = null;
//       let lateMinutes = 0;
//       let overtimeMinutes = 0;
//       let isLeaveDay = false;

//       if (record) {
//         // Get status from record
//         const recordStatus = record.status || "present";
//         status = normalizeStatus(recordStatus);
        
//         isLeaveDay = ["approved_leave", "pending_leave", "leave"].includes(recordStatus.toLowerCase());

//         checkInTime = record.checkInTime
//           ? toPakistanDate(record.checkInTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
//           : null;
//         checkOutTime = record.checkOutTime
//           ? toPakistanDate(record.checkOutTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
//           : null;

//         lateMinutes = record.lateMinutes || 0;
//         overtimeMinutes = record.overtimeMinutes || 0;

//         // Override if holiday/weekly off but still show leave if applicable
//         if (isHoliday && !isLeaveDay) {
//           status = "holiday";
//           remarks = "Public Holiday" + (record.notes ? ` - ${record.notes}` : "");
//         } else if (isWeeklyOff && !isLeaveDay) {
//           status = "weekly_off";
//           remarks = "Weekly Off" + (record.notes ? ` - ${record.notes}` : "");
//         } else {
//           remarks = record.notes || "";
//         }
//       } else {
//         // No attendance record
//         if (isHoliday) {
//           status = "holiday";
//           remarks = "Public Holiday";
//         } else if (isWeeklyOff) {
//           status = "weekly_off";
//           remarks = "Weekly Off";
//         } else if (isToday && isCurrentMonth) {
//           // Special handling for today
//           if (!todayShiftStarted) {
//             status = "not_started";
//             remarks = "Shift not started yet";
//           } else {
//             status = "absent";
//             remarks = "No Attendance Record";
//           }
//         } else {
//           status = "absent";
//           remarks = "No Attendance Record";
//         }
//       }

//       // Stats calculation (all dates in range are past/today, no future)
//       const isWorkingDay = !isHoliday && !isWeeklyOff && 
//                          !["approved_leave", "pending_leave", "holiday", "weekly_off", "not_started"].includes(status);
      
//       if (isWorkingDay) {
//         stats.totalWorkingDays++;
//       }

//       // Count present statuses
//       if (["present", "late", "half_day"].includes(status)) {
//         stats.totalPresentDays++;
//         if (status === "present") stats.present++;
//         else if (status === "late") stats.late++;
//         else if (status === "half_day") stats.half_day++;
//       }
//       // Count leave statuses
//       else if (status === "approved_leave") {
//         stats.approved_leave++;
//         stats.totalLeaveDays++;
//       }
//       else if (status === "pending_leave") {
//         stats.pending_leave++;
//         stats.totalLeaveDays++;
//       }
//       // Count absent only for working days (not today if shift not started)
//       else if (status === "absent") {
//         if (isWorkingDay && !(isToday && !todayShiftStarted)) {
//           stats.absent++;
//           stats.totalAbsentDays++;
//         }
//       }
//       // Count non-working days
//       else if (status === "holiday") {
//         stats.holiday++;
//       }
//       else if (status === "weekly_off") {
//         stats.weeklyOff++;
//       }

//       tableData.push({
//         date: key,
//         day: toPakistanDate(dateObj).toLocaleDateString("en-PK", { weekday: "short" }),
//         status,
//         checkInTime,
//         checkOutTime,
//         remarks,
//         lateMinutes,
//         overtimeMinutes,
//         rawRecord: record || null,
//         isHoliday,
//         isWeeklyOff,
//         isLeaveDay,
//         isWorkingDay,
//         isToday,
//         shiftStarted: isToday ? todayShiftStarted : true,
//         dateObj: dateObj.toISOString()
//       });
//     }

//     // Final derived stats
//     const totalPresentDays = stats.present + stats.late + stats.half_day;
    
//     // Calculate percentages
//     const attendanceRate = stats.totalWorkingDays > 0
//       ? ((totalPresentDays / stats.totalWorkingDays) * 100).toFixed(2)
//       : "0.00";
    
//     const absentRate = stats.totalWorkingDays > 0
//       ? ((stats.totalAbsentDays / stats.totalWorkingDays) * 100).toFixed(2)
//       : "0.00";
    
//     const leaveRate = tableData.length > 0
//       ? ((stats.totalLeaveDays / tableData.length) * 100).toFixed(2)
//       : "0.00";

//     return NextResponse.json({
//       success: true,
//       data: {
//         month,
//         year,
//         timezone: "Asia/Karachi",
//         firstAttendanceDate: firstAttendanceDatePK.toISOString(),
//         dateRange: {
//           start: actualStartDate.toISOString(),
//           end: actualEndDate.toISOString(),
//           totalDays: tableData.length
//         },
//         userShift: {
//           startTime: userShiftStartTime,
//           name: userData?.shift?.name || "Default Shift"
//         },
//         generatedAt: toPakistanDate(new Date()).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
//         summary: {
//           // Present counts
//           present: stats.present,
//           late: stats.late,
//           half_day: stats.half_day,
//           totalPresentDays: totalPresentDays,
          
//           // Leave counts
//           approved_leave: stats.approved_leave,
//           pending_leave: stats.pending_leave,
//           totalLeaveDays: stats.totalLeaveDays,
          
//           // Absent counts
//           absent: stats.totalAbsentDays,
//           totalAbsentDays: stats.totalAbsentDays,
          
//           // Non-working days
//           holiday: stats.holiday,
//           weeklyOff: stats.weeklyOff,
          
//           // Totals
//           totalWorkingDays: stats.totalWorkingDays,
//           totalNonWorkingDays: stats.holiday + stats.weeklyOff + stats.totalLeaveDays,
//           totalDays: tableData.length,
          
//           // Minutes
//           totalLateMinutes,
//           totalOvertimeMinutes,
          
//           // Rates
//           attendanceRate,
//           absentRate,
//           leaveRate,
//           presentPercentage: attendanceRate,
//           absentPercentage: absentRate,
//           leavePercentage: leaveRate
//         },
//         records: tableData,
//         calculationNotes: {
//           calculationStartDate: `Data calculated from first attendance: ${firstAttendanceDatePK.toLocaleDateString('en-PK')}`,
//           calculationEndDate: `Data calculated up to: ${actualEndDate.toLocaleDateString('en-PK')}`,
//           presentIncludes: "present, late, and half_day statuses",
//           leaveIncludes: "approved_leave and pending_leave (NOT counted as absent)",
//           workingDaysExcludes: "holidays, weekly offs, and all types of leaves",
//           todaySpecialCase: "If shift hasn't started yet, today is marked as 'not_started' not 'absent'",
//           ordering: "Dates shown in chronological order (oldest to newest)"
//         }
//       }
//     });
//   } catch (error) {
//     console.error("❌ Attendance GET error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }


// app/api/attendance/my/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Shift from "@/Models/Shift";
import Agent from "@/Models/Agent";
import User from "@/Models/User";

/** ---------- Pakistan Time Utilities ---------- **/

// Convert to Pakistan Time (Asia/Karachi)
function toPakistanDate(date) {
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
}

// Stable Key in Pakistan Time (YYYY-MM-DD)
function toKeyPKT(date) {
  const d = toPakistanDate(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Get dates between start and end (inclusive)
function getDatesBetween(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time to 00:00:00
  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Get first attendance date from DB
async function getFirstAttendanceDate(userId, userType) {
  const queryField = userType === "agent" ? "agent" : "user";
  
  const firstRecord = await Attendance.findOne({ [queryField]: userId })
    .sort({ date: 1, createdAt: 1, checkInTime: 1 })
    .select('date createdAt checkInTime');
    
  if (firstRecord) {
    const date = firstRecord.date || firstRecord.createdAt || firstRecord.checkInTime;
    return toPakistanDate(date);
  }
  
  // If no attendance record, get user creation date
  if (userType === "agent") {
    const agent = await Agent.findById(userId).select('createdAt');
    return agent?.createdAt ? toPakistanDate(agent.createdAt) : toPakistanDate(new Date());
  } else {
    const user = await User.findById(userId).select('createdAt');
    return user?.createdAt ? toPakistanDate(user.createdAt) : toPakistanDate(new Date());
  }
}

// Get day name in lowercase
function getDayName(date) {
  return toPakistanDate(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

// Normalize status strings
function normalizeStatus(s) {
  if (!s) return "absent";
  const str = String(s).toLowerCase();
  
  // Present categories
  if (["present"].includes(str)) return "present";
  if (["late"].includes(str)) return "late";
  if (["halfday", "half_day", "half-day", "half day"].includes(str)) return "half_day";
  
  // Leave categories
  if (["approved_leave", "approved leave", "leave_approved", "leave approved"].includes(str)) return "approved_leave";
  if (["pending_leave", "pending leave", "leave_pending", "leave pending"].includes(str)) return "pending_leave";
  if (["leave"].includes(str)) return "approved_leave";
  
  // Non-working days
  if (["holiday"].includes(str)) return "holiday";
  if (["weekly_off", "weeklyoff", "weekly-off", "weekly off"].includes(str)) return "weekly_off";
  
  // Absent
  if (["absent"].includes(str)) return "absent";
  
  return "present";
}

// Check if today's shift has started
function isShiftStartedToday(userShiftStartTime) {
  try {
    const now = toPakistanDate(new Date());
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    
    if (!userShiftStartTime || userShiftStartTime === "00:00") return true;
    
    const [shiftHour, shiftMinute] = userShiftStartTime.split(':').map(Number);
    const shiftStartMinutes = shiftHour * 60 + shiftMinute;
    
    return nowMinutes >= shiftStartMinutes;
  } catch (error) {
    return true;
  }
}

// Check if date is within requested month
function isDateInMonth(date, year, month) {
  const dateObj = new Date(date);
  return dateObj.getFullYear() === year && dateObj.getMonth() + 1 === month;
}

/** ---------- Main API ---------- **/

export async function GET(request) {
  try {
    await connectDB();
    console.log("📅 Attendance Monthly Route Triggered (Pakistan Time)");

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userId = getUserIdFromToken(decoded);
    const userType = decoded.type || "agent";

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month"));
    const year = parseInt(searchParams.get("year"));
    if (!month || !year) {
      return NextResponse.json({ success: false, message: "Month and Year are required" }, { status: 400 });
    }

    const queryField = userType === "agent" ? "agent" : "user";

    // Fetch user/agent data
    let userData, userShiftStartTime;
    if (userType === "agent") {
      userData = await Agent.findById(userId)
        .populate("shift", "startTime endTime name");
      userShiftStartTime = userData?.shift?.startTime || "09:00";
    } else {
      userData = await User.findById(userId)
        .populate("shift", "startTime endTime name");
      userShiftStartTime = userData?.shift?.startTime || "09:00";
    }

    // Get first attendance date
    const firstAttendanceDatePK = await getFirstAttendanceDate(userId, userType);
    console.log(`📅 First Attendance Date: ${firstAttendanceDatePK.toISOString()}`);
    
    // Get today's date in PKT
    const todayPK = toPakistanDate(new Date());
    const todayKey = toKeyPKT(todayPK);
    
    console.log(`📊 Requested Month: ${month}-${year}`);
    console.log(`📅 Today: ${todayKey}`);

    // Calculate date range for this month
    const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    
    // Calculate actual start date (first attendance date or month start, whichever is later)
    const actualStartDate = firstAttendanceDatePK > monthStart ? firstAttendanceDatePK : monthStart;
    
    // Calculate actual end date (today or month end, whichever is earlier)
    const actualEndDate = todayPK < monthEnd ? todayPK : new Date(monthEnd.getTime() - 1);
    
    console.log(`📅 Date Range: ${actualStartDate.toISOString()} to ${actualEndDate.toISOString()}`);

    // Get attendance records for the date range
    const attends = await Attendance.find({
      [queryField]: userId,
      $or: [
        { date: { $gte: actualStartDate, $lte: actualEndDate } },
        { checkInTime: { $gte: actualStartDate, $lte: actualEndDate } },
      ],
    })
      .populate("shift", "name startTime endTime")
      .sort({ date: -1 }); // Sort by date descending for better performance

    console.log(`📊 Found ${attends.length} attendance records in range`);

    // Map attendance by PKT key
    const attendanceMap = {};
    attends.forEach(att => {
      const source = att.date || att.checkInTime || att.createdAt;
      if (!source) return;
      const key = toKeyPKT(source);
      
      if (!attendanceMap[key]) {
        attendanceMap[key] = att;
      }
    });

    // Get all dates from first attendance to today (within requested month)
    const allDatesInRange = getDatesBetween(actualStartDate, actualEndDate);
    
    // Filter dates to only include those in requested month
    const filteredDates = allDatesInRange.filter(date => 
      isDateInMonth(date, year, month)
    );
    
    console.log(`📅 Total dates in range: ${filteredDates.length}`);

    // Check if today's shift has started (only if today is in requested month)
    const isCurrentMonth = (year === todayPK.getFullYear() && month === todayPK.getMonth() + 1);
    const todayShiftStarted = isCurrentMonth ? isShiftStartedToday(userShiftStartTime) : true;

    // Weekly Offs & Holidays
    const weeklyOffDocs = await WeeklyOff.find({ isActive: true });
    const weeklyOffSet = new Set(weeklyOffDocs.map(w => w.day.toLowerCase()));

    const holidayDocs = await Holiday.find({
      $or: [
        { date: { $gte: monthStart, $lt: monthEnd } },
        { isRecurring: true }
      ],
      isActive: true
    });

    const holidaysSet = new Set();
    for (const h of holidayDocs) {
      if (h.isRecurring && h.date) {
        const recDate = new Date(h.date);
        const recKey = `${recDate.getMonth() + 1}-${recDate.getDate()}`;
        holidaysSet.add(recKey);
      } else if (h.date) {
        holidaysSet.add(toKeyPKT(h.date));
      }
    }

    /** ---------------- Build Final Data ---------------- **/
    const tableData = [];
    let stats = {
      present: 0,
      late: 0,
      half_day: 0,
      approved_leave: 0,
      pending_leave: 0,
      absent: 0,
      holiday: 0,
      weeklyOff: 0,
      totalWorkingDays: 0,
      totalPresentDays: 0,
      totalAbsentDays: 0,
      totalLeaveDays: 0
    };

    const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
    const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

    // Process each date in REVERSE chronological order (newest to oldest)
    const sortedDates = filteredDates.sort((a, b) => b - a); // DESCENDING order
    
    for (const dateObj of sortedDates) {
      const key = toKeyPKT(dateObj);
      const isToday = key === todayKey;
      
      const record = attendanceMap[key];
      const isHoliday = holidaysSet.has(key) || holidaysSet.has(`${dateObj.getMonth() + 1}-${dateObj.getDate()}`);
      const isWeeklyOff = weeklyOffSet.has(getDayName(dateObj));
      
      let status = "absent";
      let remarks = "";
      let checkInTime = null;
      let checkOutTime = null;
      let lateMinutes = 0;
      let overtimeMinutes = 0;
      let isLeaveDay = false;

      if (record) {
        // Get status from record
        const recordStatus = record.status || "present";
        status = normalizeStatus(recordStatus);
        
        isLeaveDay = ["approved_leave", "pending_leave", "leave"].includes(recordStatus.toLowerCase());

        checkInTime = record.checkInTime
          ? toPakistanDate(record.checkInTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;
        checkOutTime = record.checkOutTime
          ? toPakistanDate(record.checkOutTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;

        lateMinutes = record.lateMinutes || 0;
        overtimeMinutes = record.overtimeMinutes || 0;

        // Override if holiday/weekly off but still show leave if applicable
        if (isHoliday && !isLeaveDay) {
          status = "holiday";
          remarks = "Public Holiday" + (record.notes ? ` - ${record.notes}` : "");
        } else if (isWeeklyOff && !isLeaveDay) {
          status = "weekly_off";
          remarks = "Weekly Off" + (record.notes ? ` - ${record.notes}` : "");
        } else {
          remarks = record.notes || "";
        }
      } else {
        // No attendance record
        if (isHoliday) {
          status = "holiday";
          remarks = "Public Holiday";
        } else if (isWeeklyOff) {
          status = "weekly_off";
          remarks = "Weekly Off";
        } else if (isToday && isCurrentMonth) {
          // Special handling for today
          if (!todayShiftStarted) {
            status = "not_started";
            remarks = "Shift not started yet";
          } else {
            status = "absent";
            remarks = "No Attendance Record";
          }
        } else {
          status = "absent";
          remarks = "No Attendance Record";
        }
      }

      // Stats calculation (all dates in range are past/today, no future)
      const isWorkingDay = !isHoliday && !isWeeklyOff && 
                         !["approved_leave", "pending_leave", "holiday", "weekly_off", "not_started"].includes(status);
      
      if (isWorkingDay) {
        stats.totalWorkingDays++;
      }

      // Count present statuses
      if (["present", "late", "half_day"].includes(status)) {
        stats.totalPresentDays++;
        if (status === "present") stats.present++;
        else if (status === "late") stats.late++;
        else if (status === "half_day") stats.half_day++;
      }
      // Count leave statuses
      else if (status === "approved_leave") {
        stats.approved_leave++;
        stats.totalLeaveDays++;
      }
      else if (status === "pending_leave") {
        stats.pending_leave++;
        stats.totalLeaveDays++;
      }
      // Count absent only for working days (not today if shift not started)
      else if (status === "absent") {
        if (isWorkingDay && !(isToday && !todayShiftStarted)) {
          stats.absent++;
          stats.totalAbsentDays++;
        }
      }
      // Count non-working days
      else if (status === "holiday") {
        stats.holiday++;
      }
      else if (status === "weekly_off") {
        stats.weeklyOff++;
      }

      tableData.push({
        date: key,
        day: toPakistanDate(dateObj).toLocaleDateString("en-PK", { weekday: "short" }),
        status,
        checkInTime,
        checkOutTime,
        remarks,
        lateMinutes,
        overtimeMinutes,
        rawRecord: record || null,
        isHoliday,
        isWeeklyOff,
        isLeaveDay,
        isWorkingDay,
        isToday,
        shiftStarted: isToday ? todayShiftStarted : true,
        dateObj: dateObj.toISOString()
      });
    }

    // Final derived stats
    const totalPresentDays = stats.present + stats.late + stats.half_day;
    
    // Calculate percentages
    const attendanceRate = stats.totalWorkingDays > 0
      ? ((totalPresentDays / stats.totalWorkingDays) * 100).toFixed(2)
      : "0.00";
    
    const absentRate = stats.totalWorkingDays > 0
      ? ((stats.totalAbsentDays / stats.totalWorkingDays) * 100).toFixed(2)
      : "0.00";
    
    const leaveRate = tableData.length > 0
      ? ((stats.totalLeaveDays / tableData.length) * 100).toFixed(2)
      : "0.00";

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        timezone: "Asia/Karachi",
        firstAttendanceDate: firstAttendanceDatePK.toISOString(),
        dateRange: {
          start: actualStartDate.toISOString(),
          end: actualEndDate.toISOString(),
          totalDays: tableData.length
        },
        userShift: {
          startTime: userShiftStartTime,
          name: userData?.shift?.name || "Default Shift"
        },
        generatedAt: toPakistanDate(new Date()).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
        summary: {
          // Present counts
          present: stats.present,
          late: stats.late,
          half_day: stats.half_day,
          totalPresentDays: totalPresentDays,
          
          // Leave counts
          approved_leave: stats.approved_leave,
          pending_leave: stats.pending_leave,
          totalLeaveDays: stats.totalLeaveDays,
          
          // Absent counts
          absent: stats.totalAbsentDays,
          totalAbsentDays: stats.totalAbsentDays,
          
          // Non-working days
          holiday: stats.holiday,
          weeklyOff: stats.weeklyOff,
          
          // Totals
          totalWorkingDays: stats.totalWorkingDays,
          totalNonWorkingDays: stats.holiday + stats.weeklyOff + stats.totalLeaveDays,
          totalDays: tableData.length,
          
          // Minutes
          totalLateMinutes,
          totalOvertimeMinutes,
          
          // Rates
          attendanceRate,
          absentRate,
          leaveRate,
          presentPercentage: attendanceRate,
          absentPercentage: absentRate,
          leavePercentage: leaveRate
        },
        records: tableData, // Already in descending order (newest to oldest)
        calculationNotes: {
          calculationStartDate: `Data calculated from first attendance: ${firstAttendanceDatePK.toLocaleDateString('en-PK')}`,
          calculationEndDate: `Data calculated up to: ${actualEndDate.toLocaleDateString('en-PK')}`,
          presentIncludes: "present, late, and half_day statuses",
          leaveIncludes: "approved_leave and pending_leave (NOT counted as absent)",
          workingDaysExcludes: "holidays, weekly offs, and all types of leaves",
          todaySpecialCase: "If shift hasn't started yet, today is marked as 'not_started' not 'absent'",
          ordering: "Dates shown in descending order (newest to oldest) - Today first, then older dates"
        }
      }
    });
  } catch (error) {
    console.error("❌ Attendance GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}