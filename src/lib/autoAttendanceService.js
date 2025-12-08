// lib/autoAttendanceService.js
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import WeeklyOff from "@/Models/WeeklyOff";
import Agent from "@/Models/Agent";
import User from "@/Models/User";
import Holiday from "@/Models/Holiday";
import moment from "moment-timezone";

// export const APP_TZ = process.env.TZ || "Asia/Karachi";
export const APP_TZ = "Asia/Karachi";

/**
 * Utility: get today start/end/now in app timezone
 */
export function getTodayDateRange(tz = APP_TZ) {
  const now = moment().tz(tz);
  const todayStart = now.clone().startOf("day").toDate();
  const todayEnd = now.clone().endOf("day").toDate();
  return { todayStart, todayEnd, now: now.toDate() };
}

/**
 * Utility: parse time "HH:mm" into a Date object anchored to referenceDate in tz
 */
export function parseShiftDateTime(referenceDate, hhmm, tz = APP_TZ) {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  const ref = moment(referenceDate).tz(tz).startOf("day").hour(h).minute(m).second(0);
  return ref.toDate();
}

/**
 * Utility: minutes difference between two Date objects
 */
export function getTimeDifferenceInMinutes(start, end) {
  if (!start || !end) return 0;
  const a = moment(start);
  const b = moment(end);
  return Math.max(0, b.diff(a, "minutes"));
}

/**
 * Shift end check using moment-timezone for reliability
 */
export function hasShiftEndedSmart(shiftEndTime, currentTime = new Date(), tz = APP_TZ) {
  if (!shiftEndTime) return true;
  try {
    const now = moment(currentTime).tz(tz);
    const [eh, em] = shiftEndTime.split(":").map(Number);
    const shiftEnd = now.clone().startOf("day").hour(eh).minute(em).second(0);

    // if end <= start (overnight), it will be handled where needed by comparing start/end pairs.
    return now.isAfter(shiftEnd);
  } catch (err) {
    console.error("hasShiftEndedSmart error:", err);
    return true;
  }
}

/**
 * Helpers: isHoliday, isWeeklyOff, isShiftDay
 * (Assumes your existing models; adapt queries if your schema differs)
 */
export async function isHoliday(dateOrNow) {
  try {
    const date = moment(dateOrNow).tz(APP_TZ).startOf("day").toDate();
    const holiday = await Holiday.findOne({
      date: { $gte: date, $lt: moment(date).endOf("day").toDate() }
    });
    return holiday || null;
  } catch (err) {
    console.error("isHoliday error:", err);
    return null;
  }
}

export async function isWeeklyOff(dateOrNow) {
  try {
    const m = moment(dateOrNow).tz(APP_TZ);
    const dayName = m.format("dddd"); // e.g., "Friday"
    const off = await WeeklyOff.findOne({ day: dayName });
    return off || null;
  } catch (err) {
    console.error("isWeeklyOff error:", err);
    return null;
  }
}

/**
 * isShiftDay - does this shift work today? (shift.days expected like ['Mon','Tue'] or ['Monday',...])
 */
export async function isShiftDay(shiftIdOrObj, dateOrNow = new Date()) {
  try {
    let shift;
    if (typeof shiftIdOrObj === "string" || shiftIdOrObj._id == null) {
      shift = await Shift.findById(shiftIdOrObj);
    } else {
      shift = shiftIdOrObj;
    }
    if (!shift) return false;
    const m = moment(dateOrNow).tz(APP_TZ);
    const dayFull = m.format("dddd"); // Monday, Tuesday...
    // support both full names or short names in shift.days
    const days = (shift.days || []).map(d => String(d).toLowerCase());
    return days.includes(dayFull.toLowerCase()) || days.includes(dayFull.slice(0, 3).toLowerCase());
  } catch (err) {
    console.error("isShiftDay error:", err);
    return false;
  }
}

/**
 * Get all active shifts keyed by id
 */
export async function getAllActiveShifts() {
  try {
    const shifts = await Shift.find({ isActive: true });
    const shiftMap = {};
    shifts.forEach(s => { shiftMap[s._id.toString()] = s; });
    return shiftMap;
  } catch (err) {
    console.error("getAllActiveShifts error:", err);
    return {};
  }
}

/**
 * Process a single user/agent for auto absent
 */
/**
 * Process a single user/agent for auto absent (handles overnight shifts perfectly)
 */
async function processUserForAutoAbsent(userObj, shift, todayStart, todayEnd, currentTime) {
  const userName = userObj.agentName || `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim() || "Unknown";
  const userId = userObj._id;
  const userType = userObj.type || (userObj.agentId ? "agent" : "user");
  const tz = APP_TZ;

  try {
    // ✅ Check if today is working day for THIS shift
    const workingDay = await isShiftDay(shift, currentTime);
    if (!workingDay) {
      return {
        userId,
        userName,
        shift: shift.name,
        markedAbsent: false,
        reason: "Not working day for this shift"
      };
    }

    // ✅ Compute shift start/end based on timezone
    const now = moment(currentTime).tz(tz);
    let shiftStart = now.clone().startOf("day");
    let shiftEnd = now.clone().startOf("day");

    // Parse start/end
    const [sh, sm] = (shift.startTime || "00:00").split(":").map(Number);
    const [eh, em] = (shift.endTime || "00:00").split(":").map(Number);

    shiftStart = shiftStart.hour(sh).minute(sm).second(0);
    shiftEnd = shiftEnd.hour(eh).minute(em).second(0);

    // ✅ Overnight handling (e.g., 11PM to 6AM next day)
    if (shiftEnd.isSameOrBefore(shiftStart)) {
      shiftEnd.add(1, "day");
    }

    // ✅ Attendance always belongs to SHIFT START DAY
    const attendanceDate = shiftStart.clone().startOf("day").toDate();

    // ✅ Skip if shift hasn't ended yet (even for overnight)
    if (now.isBefore(shiftEnd)) {
      return {
        userId,
        userName,
        shift: shift.name,
        markedAbsent: false,
        reason: `Shift not ended yet (ends at ${shiftEnd.format("HH:mm")})`
      };
    }

    // ✅ Check if attendance already exists for that date
    const query = { date: { $gte: attendanceDate, $lt: moment(attendanceDate).endOf("day").toDate() } };
    if (userObj.type === "agent" || userObj.agentId || userObj.agent) query.agent = userId;
    else query.user = userId;

    const existingAttendance = await Attendance.findOne(query);
    if (existingAttendance) {
      return {
        userId,
        userName,
        shift: shift.name,
        markedAbsent: false,
        reason: `Already has attendance: ${existingAttendance.status}`
      };
    }

    // ✅ Create Absent attendance
    const absent = await Attendance.create({
      [userObj.type === "agent" || userObj.agentId ? "agent" : "user"]: userId,
      shift: shift._id,
      date: attendanceDate,
      status: "absent",
      isLate: false,
      lateMinutes: 0,
      notes: `Auto-marked absent: No check-in before shift end (${shift.name} - ${shift.startTime} to ${shift.endTime})`,
      autoMarked: true,
      autoMarkedAt: new Date()
    });

    console.log(`❌ AUTO ABSENT CREATED: ${userName} (${shift.name}) for ${moment(attendanceDate).format("YYYY-MM-DD")}`);

    return {
      userId,
      userName,
      shift: shift.name,
      markedAbsent: true,
      attendanceId: absent._id
    };
  } catch (err) {
    console.error("processUserForAutoAbsent error for", userName, err);
    return {
      userId,
      userName,
      shift: shift.name,
      markedAbsent: false,
      error: err.message || String(err)
    };
  }
}

/**
 * markAutoAbsent - main function to mark absent for all active users/agents
 */
export async function markAutoAbsent() {
  try {
    await connectDB();
    const { todayStart, todayEnd, now } = getTodayDateRange();

    console.log("🎯 markAutoAbsent started:", { now: now.toLocaleString("en-PK", { timeZone: APP_TZ }) });

    // If holiday or weekly off, skip
    const [holiday, weeklyOff] = await Promise.all([isHoliday(now), isWeeklyOff(now)]);
    if (holiday || weeklyOff) {
      console.log("Skipping Auto Absent - today is holiday/weekly off", holiday?.name || weeklyOff?.day);
      return { success: true, message: "Skipped holiday/weekly off", totalMarkedAbsent: 0, shiftSummary: {} };
    }

    // load shifts, agents, users
    const [shiftMap, agents, users] = await Promise.all([
      getAllActiveShifts(),
      Agent.find({ isActive: true }).populate("shift"),
      User.find({ isActive: true, userType: "employee" }).populate("shift")
    ]);

    const all = [
      ...agents.map(a => ({ ...a.toObject(), type: "agent" })),
      ...users.map(u => ({ ...u.toObject(), type: "user" })),
    ];

    console.log(`Processing ${all.length} people across ${Object.keys(shiftMap).length} shifts`);

    let totalMarkedAbsent = 0;
    const results = [];
    const shiftSummary = {};

    for (const person of all) {
      try {
        const shiftRef = person.shift && shiftMap[person.shift._id?.toString ? person.shift._id.toString() : person.shift];
        if (!shiftRef) {
          results.push({ userId: person._id, userName: person.agentName || `${person.firstName} ${person.lastName}`, markedAbsent: false, reason: "No shift assigned" });
          continue;
        }

        const res = await processUserForAutoAbsent(person, shiftRef, todayStart, todayEnd, now);
        results.push(res);
        if (res.markedAbsent) {
          totalMarkedAbsent++;
          shiftSummary[res.shift] = (shiftSummary[res.shift] || 0) + 1;
        }
      } catch (err) {
        console.error("Error processing person for auto absent:", err);
      }
    }

    console.log(`Auto Absent completed. Total: ${totalMarkedAbsent}`);
    return { success: true, totalMarkedAbsent, results, shiftSummary, timestamp: now };
  } catch (err) {
    console.error("markAutoAbsent error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * AUTO CHECKOUT (single attendance) - This should only be called when API endpoint is hit.
 * It will update attendance, compute working minutes, overtime, early checkout, half-day, and save.
 */
export async function performAutoCheckout(attendance, currentTime = new Date(), locationData = null) {
  try {
    if (!attendance) throw new Error("No attendance provided");

    const tz = APP_TZ;
    // ensure we have a mongoose document
    // (attendance could be a plain object; try to fetch fresh doc if needed)
    let attendanceDoc = attendance;
    if (!attendance._id) {
      attendanceDoc = await Attendance.findById(attendance._id);
      if (!attendanceDoc) throw new Error("Attendance not found");
    }

    attendanceDoc.checkOutTime = currentTime;
    // attendanceDoc.checkOutLocation = "Auto-checkout: Frontend Triggered";
    // ✅ After (GeoJSON Object):
    attendanceDoc.checkOutLocation = {
      type: "Point",
      coordinates: [locationData.longitude, locationData.latitude],
      address: "Auto-checkout location"
    };

    // total working minutes
    const totalWorkingMinutes = getTimeDifferenceInMinutes(attendanceDoc.checkInTime, currentTime);
    attendanceDoc.totalWorkingMinutes = totalWorkingMinutes;

    // overtime / early checkout
    let isOvertime = false, overtimeMinutes = 0, isEarlyCheckout = false, earlyCheckoutMinutes = 0;

    if (attendanceDoc.shift) {
      const shift = attendanceDoc.shift;
      const checkInDate = moment(attendanceDoc.checkInTime).tz(tz);
      let shiftStart = moment(checkInDate).tz(tz).startOf("day").hour(parseInt((shift.startTime || "00:00").split(":")[0], 10)).minute(parseInt((shift.startTime || "00:00").split(":")[1], 10));
      let shiftEnd = moment(checkInDate).tz(tz).startOf("day").hour(parseInt((shift.endTime || "00:00").split(":")[0], 10)).minute(parseInt((shift.endTime || "00:00").split(":")[1], 10));

      // overnight handling
      if (!shift.startTime || !shift.endTime) {
        // if shift times missing, skip overtime logic
      } else {
        if (shiftEnd.isSameOrBefore(shiftStart)) {
          shiftEnd = shiftEnd.add(1, "day");
        }

        if (moment(currentTime).isAfter(shiftEnd)) {
          isOvertime = true;
          overtimeMinutes = getTimeDifferenceInMinutes(shiftEnd.toDate(), currentTime);
        }

        if (moment(currentTime).isBefore(shiftEnd)) {
          isEarlyCheckout = true;
          earlyCheckoutMinutes = getTimeDifferenceInMinutes(currentTime, shiftEnd.toDate());
        }
      }
    }

    // status logic
    let finalStatus = attendanceDoc.status || "present";
    const requiredMinutesForFullDay = 4 * 60;
    if (totalWorkingMinutes === 0) finalStatus = "absent";
    else if (totalWorkingMinutes < requiredMinutesForFullDay) finalStatus = "half_day";

    attendanceDoc.isOvertime = isOvertime;
    attendanceDoc.overtimeMinutes = overtimeMinutes;
    attendanceDoc.isEarlyCheckout = isEarlyCheckout;
    attendanceDoc.earlyCheckoutMinutes = earlyCheckoutMinutes;
    attendanceDoc.status = finalStatus;
    attendanceDoc.autoCheckedOut = true;
    attendanceDoc.notes = `Auto checked-out via frontend at ${moment(currentTime).tz(tz).format("HH:mm:ss")}`;

    await attendanceDoc.save();

    const populated = await Attendance.findById(attendanceDoc._id)
      .populate(attendanceDoc.agent ? "agent" : "user")
      .populate("shift");

    const workingHours = (totalWorkingMinutes / 60).toFixed(1);
    let message = `Auto checked-out successfully! ✅ (Total: ${workingHours} hours)`;
    if (isOvertime) message = `Auto checked-out successfully! 🕒 (Overtime: ${overtimeMinutes} minutes, Total: ${workingHours} hours)`;
    else if (finalStatus === "half_day") message = `Auto checked-out successfully! 📊 (Half Day: ${workingHours} hours)`;
    else if (finalStatus === "absent") message = `Auto checked-out, but marked absent (0 working minutes).`;

    console.log("✅ performAutoCheckout:", { attendanceId: populated._id.toString(), status: populated.status, workingHours });

    return { success: true, message, attendance: populated, workingHours, overtimeMinutes, finalStatus };
  } catch (err) {
    console.error("performAutoCheckout error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

// /**
//  * AUTO CHECKOUT (single attendance) - This should only be called when API endpoint is hit.
//  * It will update attendance, compute working minutes, overtime, early checkout, half-day, and save.
//  */
// export async function performAutoCheckout(attendance, currentTime = new Date(), locationData = null) {
//   try {
//     if (!attendance) throw new Error("No attendance provided");

//     const tz = APP_TZ || "Asia/Karachi";

//     // Resolve attendance document (accepts doc, id string, or plain object with _id)
//     let attendanceDoc = null;
//     const tryId = (a) => {
//       try {
//         // if it's an ObjectId-like or string
//         return String(a);
//       } catch (e) {
//         return null;
//       }
//     };

//     if (typeof attendance === "string" || typeof attendance === "object" && !attendance._id && attendance.id) {
//       // case: attendance is an id string or has 'id'
//       const id = typeof attendance === "string" ? attendance : attendance.id;
//       attendanceDoc = await Attendance.findById(id).populate(attendance && attendance.agent ? "agent" : "user").populate("shift");
//     } else if (attendance && attendance._id) {
//       // fetch fresh doc to ensure population and mongoose methods
//       attendanceDoc = await Attendance.findById(attendance._id).populate(attendance.agent ? "agent" : "user").populate("shift");
//     } else if (attendance && attendance.checkInTime) {
//       // assume it's already a doc-like object with needed fields
//       attendanceDoc = attendance;
//       // try to populate shift if it's just an id
//       if (attendanceDoc.shift && typeof attendanceDoc.shift === "object" && !attendanceDoc.shift.startTime) {
//         attendanceDoc = await Attendance.findById(attendanceDoc._id).populate(attendanceDoc.agent ? "agent" : "user").populate("shift");
//       }
//     }

//     if (!attendanceDoc) throw new Error("Attendance record not found");

//     // set checkout time & location
//     attendanceDoc.checkOutTime = currentTime;
//     if (locationData && typeof locationData.latitude === "number" && typeof locationData.longitude === "number") {
//       attendanceDoc.checkOutLocation = {
//         type: "Point",
//         coordinates: [locationData.longitude, locationData.latitude],
//         address: locationData.address || "Auto-checkout location"
//       };
//     } else if (locationData && locationData.address) {
//       attendanceDoc.checkOutLocation = { address: locationData.address };
//     }

//     // compute total working minutes (safe guard if checkInTime missing)
//     const checkInTime = attendanceDoc.checkInTime ? new Date(attendanceDoc.checkInTime) : null;
//     const totalWorkingMinutes = checkInTime ? getTimeDifferenceInMinutes(checkInTime, currentTime) : 0;
//     attendanceDoc.totalWorkingMinutes = totalWorkingMinutes;

//     // defaults
//     let isOvertime = false, overtimeMinutes = 0, isEarlyCheckout = false, earlyCheckoutMinutes = 0;
//     let finalStatus = attendanceDoc.status || "present";

//     // If shift exists, compute shiftStart/shiftEnd in APP_TZ and handle overnight
//     if (attendanceDoc.shift && attendanceDoc.shift.startTime && attendanceDoc.shift.endTime) {
//       const shift = attendanceDoc.shift;

//       // Build shift start/end moments anchored to checkIn date (use checkIn if available else currentTime)
//       const anchor = checkInTime ? moment(checkInTime).tz(tz) : moment(currentTime).tz(tz);
//       const [sH, sM] = (shift.startTime || "00:00").split(":").map(Number);
//       const [eH, eM] = (shift.endTime || "00:00").split(":").map(Number);

//       let shiftStart = moment(anchor).tz(tz).startOf("day").hour(sH).minute(sM).second(0).millisecond(0);
//       let shiftEnd = moment(anchor).tz(tz).startOf("day").hour(eH).minute(eM).second(0).millisecond(0);

//       // overnight shift (end <= start) => add 1 day to end
//       if (shiftEnd.isSameOrBefore(shiftStart)) shiftEnd = shiftEnd.add(1, "day");

//       // compute overtime / early checkout relative to shiftEnd
//       if (moment(currentTime).isAfter(shiftEnd)) {
//         isOvertime = true;
//         overtimeMinutes = getTimeDifferenceInMinutes(shiftEnd.toDate(), currentTime);
//       } else if (moment(currentTime).isBefore(shiftEnd)) {
//         isEarlyCheckout = true;
//         earlyCheckoutMinutes = getTimeDifferenceInMinutes(currentTime, shiftEnd.toDate());
//       }

//       // Shift duration and half-shift threshold
//       const shiftDurationMinutes = getTimeDifferenceInMinutes(shiftStart.toDate(), shiftEnd.toDate());
//       const halfShiftThreshold = Math.floor(shiftDurationMinutes / 2);

//       // Status decision:
//       // - If no working minutes => absent
//       // - Else if worked < halfShiftThreshold => half_day
//       // - Else keep previous status (e.g., 'late' stays 'late'), else 'present'
//       if (!checkInTime || totalWorkingMinutes <= 0) {
//         finalStatus = "absent";
//       } else if (totalWorkingMinutes < halfShiftThreshold) {
//         finalStatus = "half_day";
//       } else {
//         // keep 'late' if already late (we don't override), otherwise mark present
//         finalStatus = (String(attendanceDoc.status || "").toLowerCase() === "late") ? "late" : "present";
//       }
//     } else {
//       // No shift info: fallback to generic rules (keep previous behavior but with safer thresholds)
//       const requiredMinutesForFullDay = 4 * 60;
//       if (totalWorkingMinutes === 0) finalStatus = "absent";
//       else if (totalWorkingMinutes < requiredMinutesForFullDay) finalStatus = "half_day";
//       else finalStatus = (String(attendanceDoc.status || "").toLowerCase() === "late") ? "late" : "present";
//     }

//     // Assign computed flags & fields
//     attendanceDoc.isOvertime = isOvertime;
//     attendanceDoc.overtimeMinutes = overtimeMinutes || 0;
//     attendanceDoc.isEarlyCheckout = isEarlyCheckout;
//     attendanceDoc.earlyCheckoutMinutes = earlyCheckoutMinutes || 0;
//     attendanceDoc.status = finalStatus;
//     attendanceDoc.autoCheckedOut = true;

//     // Append a note (preserve existing notes)
//     const timeStr = moment(currentTime).tz(tz).format("HH:mm:ss");
//     attendanceDoc.notes = (attendanceDoc.notes ? attendanceDoc.notes + " | " : "") + `Auto checked-out at ${timeStr} (${tz})`;

//     await attendanceDoc.save();

//     // populate fresh for return
//     const populated = await Attendance.findById(attendanceDoc._id)
//       .populate(attendanceDoc.agent ? "agent" : "user")
//       .populate("shift");

//     const workingHours = (totalWorkingMinutes / 60).toFixed(1);
//     let message = `Auto checked-out successfully! (Total: ${workingHours} hours)`;
//     if (isOvertime) message = `Auto checked-out successfully! (Overtime: ${overtimeMinutes} minutes, Total: ${workingHours} hours)`;
//     else if (finalStatus === "half_day") message = `Auto checked-out successfully! (Half Day: ${workingHours} hours)`;
//     else if (finalStatus === "absent") message = `Auto checked-out, but marked absent (0 working minutes).`;

//     return { success: true, message, attendance: populated, workingHours, overtimeMinutes, earlyCheckoutMinutes, finalStatus };
//   } catch (err) {
//     console.error("performAutoCheckout error:", err);
//     return { success: false, error: err.message || String(err) };
//   }
// }
/**
 * Combined runner — IMPORTANT: This only runs AutoAbsent by default.
 * AutoCheckout is intentionally NOT called here (we run checkout only via API).
 */
export async function runAutoAttendanceServices() {
  try {
    console.log("🚀 runAutoAttendanceServices started");
    const absentResult = await markAutoAbsent();
    console.log("🎯 Auto Absent result:", { totalMarkedAbsent: absentResult.totalMarkedAbsent });
    return { success: true, autoAbsent: absentResult, timestamp: new Date() };
  } catch (err) {
    console.error("runAutoAttendanceServices error:", err);
    return { success: false, error: err.message || String(err) };
  }
}
