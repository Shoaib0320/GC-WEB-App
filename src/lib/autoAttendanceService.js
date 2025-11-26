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
