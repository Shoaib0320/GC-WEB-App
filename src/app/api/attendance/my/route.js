// // // app/api/attendance/my/route.js
// // import { NextResponse } from "next/server";
// // import connectDB from "@/lib/mongodb";
// // import Attendance from "@/Models/Attendance";
// // import { verifyToken, getUserIdFromToken } from "@/lib/jwt";
// // import Holiday from "@/Models/Holiday";
// // import WeeklyOff from "@/Models/WeeklyOff";
// // import Shift from "@/Models/Shift";
// // import Agent from "@/Models/Agent";
// // import User from "@/Models/User";

// // /** ---------- Pakistan Time Utilities ---------- **/

// // // Convert to Pakistan Time (Asia/Karachi)
// // function toPakistanDate(date) {
// //   return new Date(
// //     new Date(date).toLocaleString("en-US", { timeZone: "Asia/Karachi" })
// //   );
// // }

// // // Stable Key in Pakistan Time (YYYY-MM-DD)
// // function toKeyPKT(date) {
// //   const d = toPakistanDate(date);
// //   const yyyy = d.getFullYear();
// //   const mm = String(d.getMonth() + 1).padStart(2, "0");
// //   const dd = String(d.getDate()).padStart(2, "0");
// //   return `${yyyy}-${mm}-${dd}`;
// // }

// // // Get all month dates from user creation to today (Pakistan)
// // function getDatesFromUserCreationPKT(year, month, userCreationDate) {
// //   const dates = [];
// //   const today = toPakistanDate(new Date());
// //   const userCreated = toPakistanDate(userCreationDate);

// //   // month is 1-indexed
// //   const startDate = new Date(year, month - 1, 1);
// //   const actualStart = userCreated > startDate ? userCreated : startDate;

// //   const lastDay =
// //     today.getFullYear() === year && today.getMonth() + 1 === month
// //       ? today.getDate()
// //       : new Date(year, month, 0).getDate();

// //   for (let d = actualStart.getDate(); d <= lastDay; d++) {
// //     dates.push(new Date(year, month - 1, d));
// //   }
// //   return dates;
// // }

// // // Get day name in lowercase
// // function getDayName(date) {
// //   return toPakistanDate(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
// // }

// // // Normalize status strings to canonical values used in stats
// // function normalizeStatus(s) {
// //   if (!s) return "absent";
// //   const str = String(s).toLowerCase();
// //   if (["halfday", "half_day", "half-day"].includes(str)) return "half_day";
// //   if (["present"].includes(str)) return "present";
// //   if (["late"].includes(str)) return "late";
// //   if (["absent"].includes(str)) return "absent";
// //   if (["holiday"].includes(str)) return "holiday";
// //   if (["weekly_off", "weeklyoff", "weekly-off"].includes(str)) return "weekly_off";
// //   if (["approved_leave", "pending_leave", "leave"].includes(str)) return str;
// //   return str;
// // }

// // /** ---------- Main API ---------- **/

// // export async function GET(request) {
// //   try {
// //     await connectDB();
// //     console.log("📅 Attendance Monthly Route Triggered (Pakistan Time)");

// //     const authHeader = request.headers.get("authorization");
// //     if (!authHeader?.startsWith("Bearer ")) {
// //       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
// //     }

// //     const token = authHeader.split(" ")[1];
// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //       return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
// //     }

// //     const userId = getUserIdFromToken(decoded);
// //     const userType = decoded.type || "agent";

// //     const { searchParams } = new URL(request.url);
// //     const month = parseInt(searchParams.get("month"));
// //     const year = parseInt(searchParams.get("year"));
// //     if (!month || !year) {
// //       return NextResponse.json({ success: false, message: "Month and Year are required" }, { status: 400 });
// //     }

// //     const queryField = userType === "agent" ? "agent" : "user";

// //     // fetch user creation date
// //     let userCreationDate;
// //     if (userType === "agent") {
// //       const agent = await Agent.findById(userId);
// //       userCreationDate = agent?.createdAt || new Date();
// //     } else {
// //       const user = await User.findById(userId);
// //       userCreationDate = user?.createdAt || new Date();
// //     }

// //     console.log(`👤 User Creation Date: ${userCreationDate}`);
// //     console.log(`📊 Requested Month: ${month}-${year}`);

// //     // Range in UTC (safe for DB query)
// //     const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
// //     const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

// //     // Attendance records for the month (either date or checkInTime falls in range)
// //     const attends = await Attendance.find({
// //       [queryField]: userId,
// //       $or: [
// //         { date: { $gte: monthStart, $lt: monthEnd } },
// //         { checkInTime: { $gte: monthStart, $lt: monthEnd } },
// //       ],
// //     })
// //       .populate("shift", "name startTime endTime hours days")
// //       .sort({ date: 1, checkInTime: 1 });

// //     // Map attendance by PKT key (if multiple per day we keep the latest found)
// //     const attendanceMap = {};
// //     attends.forEach(att => {
// //       const source = att.date || att.checkInTime || att.createdAt;
// //       if (!source) return;
// //       const key = toKeyPKT(source);
// //       attendanceMap[key] = att; // last one wins (should be fine for single-day records)
// //     });

// //     const todayPK = toPakistanDate(new Date());
// //     const todayKey = toKeyPKT(todayPK);

// //     // Dates to include starting from user's creation (ensuring we don't show before creation)
// //     const datesFromCreation = getDatesFromUserCreationPKT(year, month, userCreationDate);

// //     // Collect keys (datesFromCreation) + any attendance days outside (future/past) within month
// //     const mergedKeysSet = new Set(datesFromCreation.map(d => toKeyPKT(d)));
// //     Object.keys(attendanceMap).forEach(k => mergedKeysSet.add(k));
// //     const mergedKeys = Array.from(mergedKeysSet);

// //     // Separate keys into past/today and future, then order:
// //     // - past/today: descending (today -> older)
// //     // - future: ascending (soonest future first)
// //     const pastAndToday = mergedKeys.filter(k => k <= todayKey).sort((a, b) => b.localeCompare(a));
// //     const futureKeys = mergedKeys.filter(k => k > todayKey).sort((a, b) => a.localeCompare(b));
// //     const finalKeys = [...pastAndToday, ...futureKeys];

// //     // Weekly Offs & Holidays (month-wide)
// //     const weeklyOffDocs = await WeeklyOff.find({ isActive: true });
// //     const weeklyOffSet = new Set(weeklyOffDocs.map(w => w.day.toLowerCase()));

// //     const holidayDocs = await Holiday.find({
// //       $or: [
// //         { date: { $gte: monthStart, $lt: monthEnd } },
// //         { isRecurring: true }
// //       ],
// //       isActive: true
// //     });

// //     const holidaysSet = new Set();
// //     for (const h of holidayDocs) {
// //       if (h.isRecurring && h.date) {
// //         // recurring: add by month-day for matching in same month
// //         const recKey = toKeyPKT(h.date); // will include year though; recurring handling might require different model
// //         // we'll add exact date if provided; recurring handling ideally needs separate logic (out of scope)
// //         holidaysSet.add(recKey);
// //       } else if (h.date) {
// //         holidaysSet.add(toKeyPKT(h.date));
// //       }
// //     }

// //     /** ---------------- Build Final Data ---------------- **/
// //     const tableData = [];
// //     let stats = {
// //       present: 0,
// //       late: 0,
// //       half_day: 0,
// //       absent: 0,
// //       holiday: 0,
// //       weeklyOff: 0,
// //       leave: 0,
// //       totalWorkingDays: 0,
// //       totalPresentDays: 0
// //     };

// //     const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
// //     const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

// //     for (const key of finalKeys) {
// //       const dateObj = new Date(`${key}T00:00:00`);
// //       const isFuture = key > todayKey;

// //       // skip dates before user creation
// //       const userCreatedPK = toPakistanDate(userCreationDate);
// //       const currentDatePK = toPakistanDate(dateObj);
// //       const isBeforeUserCreation = currentDatePK < userCreatedPK;

// //       if (isBeforeUserCreation) {
// //         tableData.push({
// //           date: key,
// //           day: toPakistanDate(dateObj).toLocaleDateString("en-PK", { weekday: "short" }),
// //           status: "not_applicable",
// //           checkInTime: null,
// //           checkOutTime: null,
// //           remarks: "User not created",
// //           lateMinutes: 0,
// //           overtimeMinutes: 0,
// //           rawRecord: null,
// //           isHoliday: false,
// //           isWeeklyOff: false,
// //           isWorkingDay: false
// //         });
// //         continue;
// //       }

// //       const record = attendanceMap[key];
// //       // default
// //       let status = "absent";
// //       let remarks = "";
// //       let checkInTime = null;
// //       let checkOutTime = null;
// //       let lateMinutes = 0;
// //       let overtimeMinutes = 0;

// //       const isHoliday = holidaysSet.has(key);
// //       const isWeeklyOff = weeklyOffSet.has(getDayName(dateObj));

// //       if (record) {
// //         // use record status but normalize
// //         status = normalizeStatus(record.status || "present");

// //         checkInTime = record.checkInTime
// //           ? toPakistanDate(record.checkInTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
// //           : null;
// //         checkOutTime = record.checkOutTime
// //           ? toPakistanDate(record.checkOutTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
// //           : null;

// //         lateMinutes = record.lateMinutes || 0;
// //         overtimeMinutes = record.overtimeMinutes || 0;

// //         // If day is holiday / weekly off, override status label but keep record saved times
// //         if (isHoliday) {
// //           remarks = "Holiday (Attendance recorded)";
// //           status = "holiday";
// //         } else if (isWeeklyOff) {
// //           remarks = "Weekly Off (Attendance recorded)";
// //           status = "weekly_off";
// //         }
// //       } else {
// //         // no record
// //         if (isHoliday) {
// //           status = "holiday";
// //           remarks = "Holiday";
// //         } else if (isWeeklyOff) {
// //           status = "weekly_off";
// //           remarks = "Weekly Off";
// //         } else {
// //           status = "absent";
// //           remarks = "No Attendance Record";
// //         }
// //       }

// //       // Stats calculation (only up to today, exclude future and before-creation)
// //       if (!isFuture && !isBeforeUserCreation) {
// //         const isWorkingDay = !isHoliday && !isWeeklyOff;
// //         if (isWorkingDay) stats.totalWorkingDays++;

// //         // Treat present/late/half_day as present
// //         if (["present", "late", "half_day"].includes(status)) {
// //           stats.totalPresentDays++;
// //           if (status === "present") stats.present++;
// //           else if (status === "late") stats.late++;
// //           else if (status === "half_day") stats.half_day++;
// //         } else if (status === "absent") {
// //           stats.absent++;
// //         } else if (status === "holiday") {
// //           stats.holiday++;
// //         } else if (status === "weekly_off") {
// //           stats.weeklyOff++;
// //         } else if (["approved_leave", "pending_leave", "leave"].includes(status)) {
// //           stats.leave++;
// //         }
// //       }

// //       tableData.push({
// //         date: key,
// //         day: toPakistanDate(dateObj).toLocaleDateString("en-PK", { weekday: "short" }),
// //         status,
// //         checkInTime,
// //         checkOutTime,
// //         remarks,
// //         lateMinutes,
// //         overtimeMinutes,
// //         rawRecord: record || null,
// //         isHoliday,
// //         isWeeklyOff,
// //         isWorkingDay: !isHoliday && !isWeeklyOff
// //       });
// //     }

// //     // Final derived stats
// //     const workingDays = stats.totalWorkingDays;
// //     const totalPresentDays = stats.present + stats.late + stats.half_day;
// //     const totalAbsentDays = stats.absent;
// //     const totalNonWorkingDays = stats.holiday + stats.weeklyOff + stats.leave;

// //     const attendanceRate = workingDays > 0
// //       ? ((totalPresentDays / workingDays) * 100).toFixed(2)
// //       : "0.00";

// //     return NextResponse.json({
// //       success: true,
// //       data: {
// //         month,
// //         year,
// //         timezone: "Asia/Karachi",
// //         userCreated: userCreationDate,
// //         generatedAt: toPakistanDate(new Date()).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
// //         summary: {
// //           present: stats.present,
// //           late: stats.late,
// //           half_day: stats.half_day,
// //           absent: stats.absent,
// //           holiday: stats.holiday,
// //           weeklyOff: stats.weeklyOff,
// //           leave: stats.leave,
// //           totalPresentDays,
// //           totalAbsentDays,
// //           totalWorkingDays: stats.totalWorkingDays,
// //           totalNonWorkingDays,
// //           totalLateMinutes,
// //           totalOvertimeMinutes,
// //           attendanceRate,
// //           presentPercentage: workingDays > 0 ? ((totalPresentDays / workingDays) * 100).toFixed(2) : "0.00",
// //           absentPercentage: workingDays > 0 ? ((stats.absent / workingDays) * 100).toFixed(2) : "0.00",
// //         },
// //         records: tableData,
// //         calculationNotes: {
// //           presentIncludes: "present, late, and half_day statuses",
// //           workingDaysExcludes: "holidays, weekly offs, and leaves",
// //           absentCountedOnlyFor: "working days without attendance records",
// //           ordering: "Dates for the requested month are ordered with today first (newest->oldest), future dates shown after."
// //         }
// //       }
// //     });
// //   } catch (error) {
// //     console.error("❌ Attendance GET error:", error);
// //     return NextResponse.json(
// //       { success: false, message: "Server error", error: error.message },
// //       { status: 500 }
// //     );
// //   }
// // }









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

// // Get all month dates from user creation to today (Pakistan)
// function getDatesFromUserCreationPKT(year, month, userCreationDate) {
//   const dates = [];
//   const today = toPakistanDate(new Date());
//   const userCreated = toPakistanDate(userCreationDate);

//   // month is 1-indexed
//   const startDate = new Date(year, month - 1, 1);
//   const actualStart = userCreated > startDate ? userCreated : startDate;

//   const lastDay =
//     today.getFullYear() === year && today.getMonth() + 1 === month
//       ? today.getDate()
//       : new Date(year, month, 0).getDate();

//   for (let d = actualStart.getDate(); d <= lastDay; d++) {
//     dates.push(new Date(year, month - 1, d));
//   }
//   return dates;
// }

// // Get day name in lowercase
// function getDayName(date) {
//   return toPakistanDate(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
// }

// // Normalize status strings to canonical values used in stats
// function normalizeStatus(s) {
//   if (!s) return "absent";
//   const str = String(s).toLowerCase();
//   if (["halfday", "half_day", "half-day"].includes(str)) return "half_day";
//   if (["present"].includes(str)) return "present";
//   if (["late"].includes(str)) return "late";
//   if (["absent"].includes(str)) return "absent";
//   if (["holiday"].includes(str)) return "holiday";
//   if (["weekly_off", "weeklyoff", "weekly-off"].includes(str)) return "weekly_off";
//   if (["approved_leave", "pending_leave", "leave"].includes(str)) return str;
//   return str;
// }

// // Check if shift has started for today
// function hasShiftStartedToday(userShift) {
//   if (!userShift || !userShift.startTime) return false;
  
//   const now = toPakistanDate(new Date());
//   const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
//   // Parse shift start time (format: "HH:MM")
//   const [startHour, startMinute] = userShift.startTime.split(':').map(Number);
//   const shiftStartTime = new Date(todayStart);
//   shiftStartTime.setHours(startHour, startMinute, 0, 0);
  
//   return now >= shiftStartTime;
// }

// // Check if today is a future date (after today)
// function isFutureDate(date) {
//   const today = toPakistanDate(new Date());
//   const checkDate = toPakistanDate(date);
  
//   // Set both to start of day for comparison
//   const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
//   const checkDateStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
  
//   return checkDateStart > todayStart;
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

//     // fetch user data and shift information
//     let userData, userShift, userCreationDate;
//     if (userType === "agent") {
//       userData = await Agent.findById(userId);
//       userShift = await Shift.findById(userData?.shift);
//       userCreationDate = userData?.createdAt || new Date();
//     } else {
//       userData = await User.findById(userId);
//       userShift = await Shift.findById(userData?.shift);
//       userCreationDate = userData?.createdAt || new Date();
//     }

//     console.log(`👤 User Creation Date: ${userCreationDate}`);
//     console.log(`📊 Requested Month: ${month}-${year}`);
//     console.log(`⏰ User Shift:`, userShift);

//     // Range in UTC (safe for DB query)
//     const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
//     const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

//     // Attendance records for the month (either date or checkInTime falls in range)
//     const attends = await Attendance.find({
//       [queryField]: userId,
//       $or: [
//         { date: { $gte: monthStart, $lt: monthEnd } },
//         { checkInTime: { $gte: monthStart, $lt: monthEnd } },
//       ],
//     })
//       .populate("shift", "name startTime endTime hours days")
//       .sort({ date: 1, checkInTime: 1 });

//     // Map attendance by PKT key (if multiple per day we keep the latest found)
//     const attendanceMap = {};
//     attends.forEach(att => {
//       const source = att.date || att.checkInTime || att.createdAt;
//       if (!source) return;
//       const key = toKeyPKT(source);
//       attendanceMap[key] = att; // last one wins (should be fine for single-day records)
//     });

//     const todayPK = toPakistanDate(new Date());
//     const todayKey = toKeyPKT(todayPK);
//     const hasTodayShiftStarted = hasShiftStartedToday(userShift);

//     console.log(`✅ Today's date: ${todayKey}`);
//     console.log(`⏰ Has shift started today: ${hasTodayShiftStarted}`);

//     // Dates to include starting from user's creation (ensuring we don't show before creation)
//     const datesFromCreation = getDatesFromUserCreationPKT(year, month, userCreationDate);

//     // Collect keys (datesFromCreation) + any attendance days outside (future/past) within month
//     const mergedKeysSet = new Set(datesFromCreation.map(d => toKeyPKT(d)));
//     Object.keys(attendanceMap).forEach(k => mergedKeysSet.add(k));
//     const mergedKeys = Array.from(mergedKeysSet);

//     // Separate keys into past/today and future, then order:
//     // - past/today: descending (today -> older)
//     // - future: ascending (soonest future first)
//     const pastAndToday = mergedKeys.filter(k => k <= todayKey).sort((a, b) => b.localeCompare(a));
//     const futureKeys = mergedKeys.filter(k => k > todayKey).sort((a, b) => a.localeCompare(b));
//     const finalKeys = [...pastAndToday, ...futureKeys];

//     // Weekly Offs & Holidays (month-wide)
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
//         // recurring: add by month-day for matching in same month
//         const recKey = toKeyPKT(h.date);
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
//       absent: 0,
//       holiday: 0,
//       weeklyOff: 0,
//       approved_leave: 0,  // ✅ Separate approved leave
//       pending_leave: 0,   // ✅ Separate pending leave
//       totalWorkingDays: 0,
//       totalPresentDays: 0,
//       totalLeaveDays: 0
//     };

//     const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
//     const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

//     for (const key of finalKeys) {
//       const dateObj = new Date(`${key}T00:00:00`);
//       const isToday = key === todayKey;
//       const isFuture = key > todayKey;

//       // skip dates before user creation
//       const userCreatedPK = toPakistanDate(userCreationDate);
//       const currentDatePK = toPakistanDate(dateObj);
//       const isBeforeUserCreation = currentDatePK < userCreatedPK;

//       if (isBeforeUserCreation) {
//         tableData.push({
//           date: key,
//           day: toPakistanDate(dateObj).toLocaleDateString("en-PK", { weekday: "short" }),
//           status: "not_applicable",
//           checkInTime: null,
//           checkOutTime: null,
//           remarks: "User not created",
//           lateMinutes: 0,
//           overtimeMinutes: 0,
//           rawRecord: null,
//           isHoliday: false,
//           isWeeklyOff: false,
//           isWorkingDay: false
//         });
//         continue;
//       }

//       const record = attendanceMap[key];
      
//       // default values
//       let status = "absent";
//       let remarks = "";
//       let checkInTime = null;
//       let checkOutTime = null;
//       let lateMinutes = 0;
//       let overtimeMinutes = 0;

//       const isHoliday = holidaysSet.has(key);
//       const isWeeklyOff = weeklyOffSet.has(getDayName(dateObj));

//       if (record) {
//         // use record status but normalize
//         status = normalizeStatus(record.status || "present");

//         checkInTime = record.checkInTime
//           ? toPakistanDate(record.checkInTime).toLocaleTimeString("en-PK", { 
//               hour: "2-digit", 
//               minute: "2-digit", 
//               hour12: true 
//             })
//           : null;
//         checkOutTime = record.checkOutTime
//           ? toPakistanDate(record.checkOutTime).toLocaleTimeString("en-PK", { 
//               hour: "2-digit", 
//               minute: "2-digit", 
//               hour12: true 
//             })
//           : null;

//         lateMinutes = record.lateMinutes || 0;
//         overtimeMinutes = record.overtimeMinutes || 0;

//         // If day is holiday / weekly off, override status label but keep record saved times
//         if (isHoliday) {
//           remarks = "Holiday (Attendance recorded)";
//           status = "holiday";
//         } else if (isWeeklyOff) {
//           remarks = "Weekly Off (Attendance recorded)";
//           status = "weekly_off";
//         }
//       } else {
//         // no record found
//         if (isHoliday) {
//           status = "holiday";
//           remarks = "Holiday";
//         } else if (isWeeklyOff) {
//           status = "weekly_off";
//           remarks = "Weekly Off";
//         } else {
//           // ✅ FIXED: For today, if shift hasn't started yet, show "pending" instead of "absent"
//           if (isToday && !hasTodayShiftStarted) {
//             status = "pending";
//             remarks = "Shift not started yet";
//           } else {
//             status = "absent";
//             remarks = "No Attendance Record";
//           }
//         }
//       }

//       // ✅ FIXED: Stats calculation - ONLY FOR PAST DAYS (not today or future)
//       if (!isFuture && !isBeforeUserCreation && !isToday) {
//         const isWorkingDay = !isHoliday && !isWeeklyOff;
        
//         if (isWorkingDay) {
//           stats.totalWorkingDays++;
          
//           // ✅ FIXED: Present statuses
//           if (["present", "late", "half_day"].includes(status)) {
//             stats.totalPresentDays++;
//             if (status === "present") stats.present++;
//             else if (status === "late") stats.late++;
//             else if (status === "half_day") stats.half_day++;
//           } 
//           // ✅ FIXED: Leave handling - separate approved and pending
//           else if (status === "approved_leave") {
//             stats.approved_leave++;
//             stats.totalLeaveDays++;
//           } 
//           else if (status === "pending_leave") {
//             stats.pending_leave++;
//             stats.totalLeaveDays++;
//           }
//           else if (status === "leave") {
//             // Default leave as approved
//             stats.approved_leave++;
//             stats.totalLeaveDays++;
//           }
//           // ✅ FIXED: Only count as absent for working days without any record
//           else if (status === "absent" && isWorkingDay) {
//             stats.absent++;
//           }
//         }
//         // For non-working days
//         else {
//           if (status === "holiday") {
//             stats.holiday++;
//           } else if (status === "weekly_off") {
//             stats.weeklyOff++;
//           }
//         }
//       }
      
//       // ✅ For today, handle specially
//       if (isToday) {
//         if (isHoliday) {
//           status = "holiday";
//           remarks = "Today is a holiday";
//         } else if (isWeeklyOff) {
//           status = "weekly_off";
//           remarks = "Today is weekly off";
//         }
//         // If today is a working day and no record yet
//         else if (!record && !hasTodayShiftStarted) {
//           status = "pending";
//           remarks = "Today - Shift not started yet";
//         }
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
//         isWorkingDay: !isHoliday && !isWeeklyOff,
//         isToday: isToday,
//         isFuture: isFuture,
//         shiftStartedToday: isToday ? hasTodayShiftStarted : null
//       });
//     }

//     // ✅ FIXED: Final derived stats
//     const workingDays = stats.totalWorkingDays;
//     const totalPresentDays = stats.present + stats.late + stats.half_day;
//     const totalAbsentDays = stats.absent;
//     const totalLeaveDays = stats.approved_leave + stats.pending_leave;
//     const totalNonWorkingDays = stats.holiday + stats.weeklyOff + totalLeaveDays;

//     // ✅ FIXED: Calculate percentages correctly
//     const attendanceRate = workingDays > 0
//       ? ((totalPresentDays / workingDays) * 100).toFixed(2)
//       : "0.00";

//     const presentPercentage = workingDays > 0
//       ? ((totalPresentDays / workingDays) * 100).toFixed(2)
//       : "0.00";

//     const absentPercentage = workingDays > 0
//       ? ((stats.absent / workingDays) * 100).toFixed(2)
//       : "0.00";

//     const leavePercentage = workingDays > 0
//       ? ((totalLeaveDays / workingDays) * 100).toFixed(2)
//       : "0.00";

//     // ✅ Total days in the month (for reference)
//     const totalDaysInMonth = new Date(year, month, 0).getDate();

//     return NextResponse.json({
//       success: true,
//       data: {
//         month,
//         year,
//         timezone: "Asia/Karachi",
//         userCreated: userCreationDate,
//         userShift: userShift || null,
//         generatedAt: toPakistanDate(new Date()).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
//         summary: {
//           // ✅ Present Counts (all counted as present)
//           present: stats.present,
//           late: stats.late,
//           half_day: stats.half_day,
//           totalPresentDays: totalPresentDays,
          
//           // ✅ Absent Counts
//           absent: stats.absent,
          
//           // ✅ Leave Counts (separated)
//           approved_leave: stats.approved_leave,
//           pending_leave: stats.pending_leave,
//           totalLeaveDays: totalLeaveDays,
          
//           // ✅ Non-working days
//           holiday: stats.holiday,
//           weeklyOff: stats.weeklyOff,
          
//           // ✅ Totals
//           totalWorkingDays: stats.totalWorkingDays,
//           totalNonWorkingDays: totalNonWorkingDays,
//           totalLateMinutes,
//           totalOvertimeMinutes,
          
//           // ✅ Rates
//           attendanceRate,
//           presentPercentage,
//           absentPercentage,
//           leavePercentage,
          
//           // ✅ Today's status
//           today: {
//             date: todayKey,
//             shiftStarted: hasTodayShiftStarted,
//             isHoliday: holidaysSet.has(todayKey),
//             isWeeklyOff: weeklyOffSet.has(getDayName(todayPK))
//           }
//         },
//         records: tableData,
//         calculationNotes: {
//           presentIncludes: "present, late, and half_day statuses are all counted as present",
//           workingDaysExcludes: "holidays, weekly offs, and all types of leaves",
//           leaveHandling: "approved_leave and pending_leave are NOT counted as absent or present",
//           todayHandling: "Today shows as 'pending' if shift hasn't started yet and no attendance recorded",
//           absentCountedOnlyFor: "working days without attendance records (excluding today if shift hasn't started)",
//           statsBasedOn: "Only past days (excluding today and future dates)"
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

// Get all month dates from user creation to today (Pakistan)
function getDatesFromUserCreationPKT(year, month, userCreationDate) {
  const dates = [];
  const today = toPakistanDate(new Date());
  const userCreated = toPakistanDate(userCreationDate);

  // month is 1-indexed
  const startDate = new Date(year, month - 1, 1);
  const actualStart = userCreated > startDate ? userCreated : startDate;

  const lastDay =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? today.getDate()
      : new Date(year, month, 0).getDate();

  for (let d = actualStart.getDate(); d <= lastDay; d++) {
    dates.push(new Date(year, month - 1, d));
  }
  return dates;
}

// Get day name in lowercase
function getDayName(date) {
  return toPakistanDate(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

// Normalize status strings to canonical values
function normalizeStatus(s) {
  if (!s) return "absent";
  const str = String(s).toLowerCase();
  
  if (["halfday", "half_day", "half-day"].includes(str)) return "half_day";
  if (["present"].includes(str)) return "present";
  if (["late"].includes(str)) return "late";
  if (["absent"].includes(str)) return "absent";
  if (["holiday"].includes(str)) return "holiday";
  if (["weekly_off", "weeklyoff", "weekly-off"].includes(str)) return "weekly_off";
  if (["approved_leave"].includes(str)) return "approved_leave";
  if (["pending_leave"].includes(str)) return "pending_leave";
  if (["leave"].includes(str)) return "approved_leave"; // Default leave to approved
  
  return str;
}

// Check if shift time has started for today
function hasShiftStartedToday(userShift) {
  if (!userShift || !userShift.startTime) return true; // If no shift, assume started
  
  const now = toPakistanDate(new Date());
  const today = toKeyPKT(now);
  
  // Get today's date components
  const todayDate = new Date(today);
  
  // Parse shift start time
  const [startHour, startMinute] = userShift.startTime.split(':').map(Number);
  
  // Create shift start time for today
  const shiftStartTime = new Date(todayDate);
  shiftStartTime.setHours(startHour, startMinute, 0, 0);
  
  // Check if current time is after shift start time
  return now >= shiftStartTime;
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

    // Fetch user data with shift info
    let userData, userShift, userCreationDate;
    
    if (userType === "agent") {
      userData = await Agent.findById(userId).populate("shift", "name startTime endTime");
      userShift = userData?.shift;
      userCreationDate = userData?.createdAt || new Date();
    } else {
      userData = await User.findById(userId).populate("shift", "name startTime endTime");
      userShift = userData?.shift;
      userCreationDate = userData?.createdAt || new Date();
    }

    console.log(`👤 User Creation Date: ${userCreationDate}`);
    console.log(`📊 Requested Month: ${month}-${year}`);
    console.log(`🕒 User Shift: ${JSON.stringify(userShift)}`);

    // Range in UTC (safe for DB query)
    const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    // Attendance records for the month
    const attends = await Attendance.find({
      [queryField]: userId,
      $or: [
        { date: { $gte: monthStart, $lt: monthEnd } },
        { checkInTime: { $gte: monthStart, $lt: monthEnd } },
      ],
    })
      .populate("shift", "name startTime endTime hours days")
      .sort({ date: 1, checkInTime: 1 });

    // Map attendance by PKT key
    const attendanceMap = {};
    attends.forEach(att => {
      const source = att.date || att.checkInTime || att.createdAt;
      if (!source) return;
      const key = toKeyPKT(source);
      // If multiple records for same day, keep the latest one
      if (!attendanceMap[key] || new Date(source) > new Date(attendanceMap[key].date || attendanceMap[key].createdAt)) {
        attendanceMap[key] = att;
      }
    });

    const todayPK = toPakistanDate(new Date());
    const todayKey = toKeyPKT(todayPK);
    const todayDateObj = new Date(todayKey);
    const isTodayInRequestedMonth = 
      todayDateObj.getFullYear() === year && 
      todayDateObj.getMonth() + 1 === month;

    console.log(`📅 Today: ${todayKey}, In requested month: ${isTodayInRequestedMonth}`);

    // Dates to include starting from user's creation
    const datesFromCreation = getDatesFromUserCreationPKT(year, month, userCreationDate);

    // Collect keys (datesFromCreation) + any attendance days
    const mergedKeysSet = new Set(datesFromCreation.map(d => toKeyPKT(d)));
    Object.keys(attendanceMap).forEach(k => mergedKeysSet.add(k));
    const mergedKeys = Array.from(mergedKeysSet);

    // Separate keys into past/today and future
    const pastAndToday = mergedKeys.filter(k => k <= todayKey).sort((a, b) => b.localeCompare(a));
    const futureKeys = mergedKeys.filter(k => k > todayKey).sort((a, b) => a.localeCompare(b));
    const finalKeys = [...pastAndToday, ...futureKeys];

    // Weekly Offs & Holidays (month-wide)
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
        if (recDate.getMonth() + 1 === month) {
          holidaysSet.add(toKeyPKT(new Date(year, month - 1, recDate.getDate())));
        }
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
      absent: 0,
      holiday: 0,
      weeklyOff: 0,
      approved_leave: 0,
      pending_leave: 0,
      totalWorkingDays: 0,
      totalPresentDays: 0,
      totalLeaveDays: 0
    };

    const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
    const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

    for (const key of finalKeys) {
      const dateObj = new Date(`${key}T00:00:00`);
      const isFuture = key > todayKey;
      const isToday = key === todayKey;

      // Check if today's shift has started
      const isShiftStarted = isToday ? hasShiftStartedToday(userShift) : true;

      // Skip dates before user creation
      const userCreatedPK = toPakistanDate(userCreationDate);
      const currentDatePK = toPakistanDate(dateObj);
      const isBeforeUserCreation = currentDatePK < userCreatedPK;

      if (isBeforeUserCreation) {
        tableData.push({
          date: key,
          day: toPakistanDate(dateObj).toLocaleDateString("en-PK", { weekday: "short" }),
          status: "not_applicable",
          checkInTime: null,
          checkOutTime: null,
          remarks: "User not created",
          lateMinutes: 0,
          overtimeMinutes: 0,
          rawRecord: null,
          isHoliday: false,
          isWeeklyOff: false,
          isWorkingDay: false,
          isToday: isToday
        });
        continue;
      }

      const record = attendanceMap[key];
      // Default values
      let status = "absent";
      let remarks = "";
      let checkInTime = null;
      let checkOutTime = null;
      let lateMinutes = 0;
      let overtimeMinutes = 0;

      const isHoliday = holidaysSet.has(key);
      const isWeeklyOff = weeklyOffSet.has(getDayName(dateObj));
      const isWorkingDay = !isHoliday && !isWeeklyOff;

      if (record) {
        // Use record status but normalize
        status = normalizeStatus(record.status || "present");

        checkInTime = record.checkInTime
          ? toPakistanDate(record.checkInTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;
        checkOutTime = record.checkOutTime
          ? toPakistanDate(record.checkOutTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;

        lateMinutes = record.lateMinutes || 0;
        overtimeMinutes = record.overtimeMinutes || 0;

        // If day is holiday/weekly off but attendance recorded
        if (isHoliday) {
          remarks = "Holiday (Attendance recorded)";
          status = "holiday";
        } else if (isWeeklyOff) {
          remarks = "Weekly Off (Attendance recorded)";
          status = "weekly_off";
        } else if (status === "approved_leave" || status === "pending_leave") {
          remarks = `${status.replace('_', ' ').toUpperCase()} (Attendance exempted)`;
        }
      } else {
        // No record
        if (isHoliday) {
          status = "holiday";
          remarks = "Holiday";
        } else if (isWeeklyOff) {
          status = "weekly_off";
          remarks = "Weekly Off";
        } else if (isToday && !isShiftStarted) {
          // Today's shift hasn't started yet - show as pending
          status = "pending";
          remarks = "Shift not started yet";
        } else {
          status = "absent";
          remarks = "No Attendance Record";
        }
      }

      // Stats calculation (only up to yesterday, exclude today if shift hasn't started)
      const shouldCountForStats = !isFuture && 
                                  !isBeforeUserCreation && 
                                  !(isToday && !isShiftStarted && status === "pending");

      if (shouldCountForStats) {
        if (isWorkingDay) stats.totalWorkingDays++;

        // Treat present/late/half_day as present
        if (["present", "late", "half_day"].includes(status)) {
          stats.totalPresentDays++;
          if (status === "present") stats.present++;
          else if (status === "late") stats.late++;
          else if (status === "half_day") stats.half_day++;
        } 
        // Leaves are NOT counted as absent
        else if (status === "approved_leave") {
          stats.approved_leave++;
          stats.totalLeaveDays++;
        }
        else if (status === "pending_leave") {
          stats.pending_leave++;
          stats.totalLeaveDays++;
        }
        // Only count as absent if it's a working day without leave
        else if (status === "absent" && isWorkingDay) {
          stats.absent++;
        }
        else if (status === "holiday") {
          stats.holiday++;
        }
        else if (status === "weekly_off") {
          stats.weeklyOff++;
        }
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
        isWorkingDay,
        isToday,
        shiftStarted: isShiftStarted
      });
    }

    // Final derived stats
    const workingDays = stats.totalWorkingDays;
    const totalPresentDays = stats.present + stats.late + stats.half_day;
    const totalAbsentDays = stats.absent;
    const totalLeaveDays = stats.approved_leave + stats.pending_leave;
    const totalNonWorkingDays = stats.holiday + stats.weeklyOff + totalLeaveDays;

    // Calculate rates
    const attendanceRate = workingDays > 0
      ? ((totalPresentDays / workingDays) * 100).toFixed(2)
      : "0.00";

    const presentPercentage = workingDays > 0
      ? ((totalPresentDays / workingDays) * 100).toFixed(2)
      : "0.00";

    const absentPercentage = workingDays > 0
      ? ((stats.absent / workingDays) * 100).toFixed(2)
      : "0.00";

    const leavePercentage = (workingDays + totalLeaveDays) > 0
      ? ((totalLeaveDays / (workingDays + totalLeaveDays)) * 100).toFixed(2)
      : "0.00";

    // Get first attendance date for the user
    const firstAttendance = await Attendance.findOne({
      [queryField]: userId
    }).sort({ createdAt: 1, date: 1 });

    const firstAttendanceDate = firstAttendance ? 
      (firstAttendance.date || firstAttendance.createdAt) : 
      userCreationDate;

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        timezone: "Asia/Karachi",
        userCreated: userCreationDate,
        firstAttendanceDate: firstAttendanceDate,
        generatedAt: toPakistanDate(new Date()).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
        userShift: userShift ? {
          name: userShift.name,
          startTime: userShift.startTime,
          endTime: userShift.endTime
        } : null,
        summary: {
          // Present counts
          present: stats.present,
          late: stats.late,
          half_day: stats.half_day,
          totalPresentDays: totalPresentDays,
          
          // Absent counts (only working days without leave)
          absent: stats.absent,
          totalAbsentDays: totalAbsentDays,
          
          // Leave counts (separated)
          approved_leave: stats.approved_leave,
          pending_leave: stats.pending_leave,
          totalLeaveDays: totalLeaveDays,
          
          // Non-working days
          holiday: stats.holiday,
          weeklyOff: stats.weeklyOff,
          totalNonWorkingDays: totalNonWorkingDays,
          
          // Totals
          totalWorkingDays: workingDays,
          totalDaysInMonth: new Date(year, month, 0).getDate(),
          totalLateMinutes,
          totalOvertimeMinutes,
          
          // Rates
          attendanceRate,
          presentPercentage,
          absentPercentage,
          leavePercentage,
          workingDaysPercentage: ((workingDays / new Date(year, month, 0).getDate()) * 100).toFixed(2)
        },
        records: tableData,
        calculationNotes: {
          firstAttendanceDate: "Data shown from user's first attendance record",
          presentIncludes: "present, late, and half_day statuses",
          workingDaysExcludes: "holidays, weekly offs, and all types of leaves",
          leaveHandling: "approved_leave and pending_leave are NOT counted as absent",
          todayHandling: "Today shows as 'pending' if shift hasn't started yet",
          absentCountedOnlyFor: "working days without attendance records and without leave status",
          ordering: "Dates for the requested month are ordered with today first (newest->oldest), future dates shown after."
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