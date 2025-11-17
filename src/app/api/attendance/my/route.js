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
  
//   // Agar user current month ke pehle create hua hai, toh month ke first day se start karo
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

//     // ✅ User ka creation date fetch karo
//     let userCreationDate;
//     if (userType === "agent") {
//       const agent = await Agent.findById(userId);
//       userCreationDate = agent?.createdAt || new Date();
//     } else {
//       const user = await User.findById(userId);
//       userCreationDate = user?.createdAt || new Date();
//     }

//     console.log(`👤 User Creation Date: ${userCreationDate}`);
//     console.log(`📊 Requested Month: ${month}-${year}`);

//     // Range
//     const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
//     const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

//     // Attendance records for the month
//     const attends = await Attendance.find({
//       [queryField]: userId,
//       $or: [
//         { date: { $gte: monthStart, $lt: monthEnd } },
//         { checkInTime: { $gte: monthStart, $lt: monthEnd } },
//       ],
//     })
//       .populate("shift", "name startTime endTime hours days")
//       .sort({ date: 1, checkInTime: 1 });

//     const attendanceMap = {};
//     attends.forEach(att => {
//       const source = att.date || att.checkInTime || att.createdAt;
//       if (!source) return;
//       const key = toKeyPKT(source);
//       attendanceMap[key] = att;
//     });

//     const todayPK = toPakistanDate(new Date());
//     const todayKey = toKeyPKT(todayPK);

//     // ✅ User creation date ke hisab se dates generate karo
//     const datesFromCreation = getDatesFromUserCreationPKT(year, month, userCreationDate);

//     // Also include future approved leave etc.
//     const futureKeys = new Set();
//     attends.forEach(att => {
//       const key = toKeyPKT(att.date || att.checkInTime || att.createdAt);
//       if (key > todayKey) futureKeys.add(key);
//     });

//     // Combine dates from creation + future records
//     const mergedKeysSet = new Set(datesFromCreation.map(d => toKeyPKT(d)));
//     for (const fk of futureKeys) mergedKeysSet.add(fk);
//     const mergedKeys = Array.from(mergedKeysSet).sort();

//     // Weekly Offs & Holidays (month-wide)
//     const weeklyOffDocs = await WeeklyOff.find({ isActive: true });
//     const weeklyOffSet = new Set(weeklyOffDocs.map(w => w.day.toLowerCase()));

//     const monthStartPK = toPakistanDate(new Date(Date.UTC(year, month - 1, 1)));
//     const monthEndPK = toPakistanDate(new Date(Date.UTC(year, month, 0)));

//     const holidayDocs = await Holiday.find({
//       $or: [
//         { date: { $gte: monthStart, $lt: monthEnd } },
//         { isRecurring: true }
//       ],
//       isActive: true
//     });

//     const holidaysSet = new Set();
//     for (const h of holidayDocs) {
//       const dateKey = toKeyPKT(h.date);
//       holidaysSet.add(dateKey);
//     }

//     /** ---------------- Build Final Data ---------------- **/

//     const tableData = [];
//     let stats = { present: 0, late: 0, absent: 0, holiday: 0, weeklyOff: 0, leave: 0 };

//     const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
//     const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

//     for (const key of mergedKeys) {
//       const dateObj = new Date(`${key}T00:00:00`);
//       const isFuture = key > todayKey;
      
//       // ✅ Check if date is before user creation
//       const userCreatedPK = toPakistanDate(userCreationDate);
//       const currentDatePK = toPakistanDate(dateObj);
//       const isBeforeUserCreation = currentDatePK < userCreatedPK;

//       if (isBeforeUserCreation) {
//         // User creation se pehle ki date hai - skip karo ya "not_applicable" mark karo
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
//         });
//         continue;
//       }

//       const record = attendanceMap[key];
//       let status = "absent";
//       let remarks = "";
//       let checkInTime = null;
//       let checkOutTime = null;
//       let lateMinutes = 0;
//       let overtimeMinutes = 0;

//       if (record) {
//         status = record.status || "present";
//         checkInTime = record.checkInTime
//           ? toPakistanDate(record.checkInTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
//           : null;
//         checkOutTime = record.checkOutTime
//           ? toPakistanDate(record.checkOutTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
//           : null;
//         lateMinutes = record.lateMinutes || 0;
//         overtimeMinutes = record.overtimeMinutes || 0;
//       } else {
//         // Future with no record → skip
//         if (isFuture) continue;

//         // Check if holiday or weekly off
//         if (holidaysSet.has(key)) {
//           status = "holiday";
//           remarks = "Holiday";
//         } else {
//           const weekday = toPakistanDate(dateObj)
//             .toLocaleDateString("en-US", { weekday: "long" })
//             .toLowerCase();
//           if (weeklyOffSet.has(weekday)) {
//             status = "weekly_off";
//             remarks = "Weekly Off";
//           } else {
//             status = "absent";
//             remarks = "No Attendance Record";
//           }
//         }
//       }

//       // Stats (up to today)
//       if (!isFuture && !isBeforeUserCreation) {
//         if (status === "present") stats.present++;
//         else if (status === "late") stats.late++;
//         else if (status === "absent") stats.absent++;
//         else if (status === "holiday") stats.holiday++;
//         else if (status === "weekly_off") stats.weeklyOff++;
//         else if (["approved_leave", "pending_leave", "leave"].includes(status)) stats.leave++;
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
//       });
//     }

//     const workingDays = datesFromCreation.length - (stats.holiday + stats.weeklyOff);
//     const attendanceRate =
//       workingDays > 0
//         ? ((stats.present + stats.late) / workingDays * 100).toFixed(2)
//         : "0.00";

//     return NextResponse.json({
//       success: true,
//       data: {
//         month,
//         year,
//         timezone: "Asia/Karachi",
//         userCreated: userCreationDate,
//         generatedAt: toPakistanDate(new Date()).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
//         summary: {
//           present: stats.present,
//           late: stats.late,
//           absent: stats.absent,
//           holiday: stats.holiday,
//           weeklyOff: stats.weeklyOff,
//           leave: stats.leave,
//           totalLateMinutes,
//           totalOvertimeMinutes,
//           attendanceRate,
//         },
//         records: tableData,
//       },
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

// Get all month dates (Pakistan)
function getMonthDatesPKT(year, month) {
  const dates = [];
  const lastDay = new Date(year, month, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    dates.push(new Date(year, month - 1, d));
  }
  return dates;
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

    // ✅ Check if user exists and get creation date
    let userCreatedAt = null;
    if (userType === "agent") {
      const agent = await Agent.findById(userId);
      userCreatedAt = agent?.createdAt;
    } else {
      const user = await User.findById(userId);
      userCreatedAt = user?.createdAt;
    }

    // ✅ Agar user current month ke start se pehle create hua hai, toh uss date se pehle ka data nahi dikhana
    const userCreatedAtPKT = userCreatedAt ? toPakistanDate(userCreatedAt) : null;
    const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    // ✅ Agar user current month ke start ke baad create hua hai, toh uski creation date se start karo
    const effectiveStartDate = userCreatedAtPKT && userCreatedAtPKT > monthStart ? 
      userCreatedAtPKT : monthStart;

    const queryField = userType === "agent" ? "agent" : "user";

    // ✅ Attendance records for the month (only after user creation)
    const attends = await Attendance.find({
      [queryField]: userId,
      $or: [
        { 
          date: { 
            $gte: effectiveStartDate, 
            $lt: monthEnd 
          } 
        },
        { 
          checkInTime: { 
            $gte: effectiveStartDate, 
            $lt: monthEnd 
          } 
        },
      ],
    })
      .populate("shift", "name startTime endTime hours days")
      .sort({ date: -1, checkInTime: -1 }); // ✅ DESC order for latest first

    // ✅ Create attendance map
    const attendanceMap = {};
    attends.forEach(att => {
      const source = att.date || att.checkInTime || att.createdAt;
      if (!source) return;
      const key = toKeyPKT(source);
      attendanceMap[key] = att;
    });

    const todayPK = toPakistanDate(new Date());
    const todayKey = toKeyPKT(todayPK);

    // ✅ Get all dates for the month
    const allMonthDates = getMonthDatesPKT(year, month);
    
    // ✅ Filter out dates before user creation
    const validMonthDates = userCreatedAtPKT ? 
      allMonthDates.filter(date => date >= userCreatedAtPKT) : 
      allMonthDates;

    // ✅ Weekly Offs & Holidays
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
      const dateKey = toKeyPKT(h.date);
      holidaysSet.add(dateKey);
    }

    /** ---------------- Build Final Data ---------------- **/

    const tableData = [];
    let stats = { present: 0, late: 0, absent: 0, holiday: 0, weeklyOff: 0, leave: 0 };

    const totalLateMinutes = attends.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
    const totalOvertimeMinutes = attends.reduce((sum, a) => sum + (a.overtimeMinutes || 0), 0);

    // ✅ Sort dates in descending order (latest first)
    const sortedDates = [...validMonthDates].sort((a, b) => b - a);

    for (const dateObj of sortedDates) {
      const key = toKeyPKT(dateObj);
      const isFuture = key > todayKey;
      const record = attendanceMap[key];
      
      let status = "absent";
      let remarks = "";
      let checkInTime = null;
      let checkOutTime = null;
      let lateMinutes = 0;
      let overtimeMinutes = 0;

      if (record) {
        status = record.status || "present";
        checkInTime = record.checkInTime
          ? toPakistanDate(record.checkInTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;
        checkOutTime = record.checkOutTime
          ? toPakistanDate(record.checkOutTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true })
          : null;
        lateMinutes = record.lateMinutes || 0;
        overtimeMinutes = record.overtimeMinutes || 0;
      } else {
        // Future with no record → skip
        if (isFuture) continue;

        // Check if holiday or weekly off
        if (holidaysSet.has(key)) {
          status = "holiday";
          remarks = "Holiday";
        } else {
          const weekday = toPakistanDate(dateObj)
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase();
          if (weeklyOffSet.has(weekday)) {
            status = "weekly_off";
            remarks = "Weekly Off";
          } else {
            status = "absent";
            remarks = "No Attendance Record";
          }
        }
      }

      // ✅ Stats (only for dates up to today and after user creation)
      if (!isFuture) {
        if (status === "present") stats.present++;
        else if (status === "late") stats.late++;
        else if (status === "absent") stats.absent++;
        else if (status === "holiday") stats.holiday++;
        else if (status === "weekly_off") stats.weeklyOff++;
        else if (["approved_leave", "pending_leave", "leave"].includes(status)) stats.leave++;
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
      });
    }

    // ✅ Calculate working days (only valid dates)
    const workingDays = validMonthDates.filter(date => {
      const key = toKeyPKT(date);
      const isPast = key <= todayKey;
      if (!isPast) return false;
      
      if (holidaysSet.has(key)) return false;
      
      const weekday = toPakistanDate(date)
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      if (weeklyOffSet.has(weekday)) return false;
      
      return true;
    }).length;

    const attendanceRate =
      workingDays > 0
        ? ((stats.present + stats.late) / workingDays * 100).toFixed(2)
        : "0.00";

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        timezone: "Asia/Karachi",
        userCreatedAt: userCreatedAtPKT,
        effectiveStartDate: effectiveStartDate,
        generatedAt: toPakistanDate(new Date()).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
        summary: {
          present: stats.present,
          late: stats.late,
          absent: stats.absent,
          holiday: stats.holiday,
          weeklyOff: stats.weeklyOff,
          leave: stats.leave,
          totalLateMinutes,
          totalOvertimeMinutes,
          attendanceRate,
          workingDays,
        },
        records: tableData, // ✅ Already sorted in DESC order
      },
    });
  } catch (error) {
    console.error("❌ Attendance GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}