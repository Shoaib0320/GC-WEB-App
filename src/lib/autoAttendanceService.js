// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Shift from "@/Models/Shift";
// import Holiday from "@/Models/Holiday";
// import WeeklyOff from "@/Models/WeeklyOff";
// import Agent from "@/Models/Agent";
// import User from "@/Models/User";
// import { 
//   isHoliday, 
//   isWeeklyOff, 
//   isShiftDay,
//   getTimeDifferenceInMinutes,
//   parseShiftDateTime
// } from "@/lib/attendanceUtils";

// const DEFAULT_TZ = "Asia/Karachi";

// /**
//  * 🔥 SMART SHIFT END CHECK
//  */
// function hasShiftEndedSmart(shiftEndTime, currentTime, timezone = DEFAULT_TZ) {
//   if (!shiftEndTime) return true;
  
//   try {
//     const [endHours, endMinutes] = shiftEndTime.split(':').map(Number);
    
//     // Convert to target timezone
//     const currentInTz = new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));
//     const shiftEnd = new Date(currentInTz);
//     shiftEnd.setHours(endHours, endMinutes, 0, 0);
    
//     const hasEnded = currentInTz > shiftEnd;
    
//     console.log(`⏰ Shift End Check:`, {
//       shiftEndTime,
//       currentTime: currentInTz.toLocaleTimeString(),
//       shiftEnd: shiftEnd.toLocaleTimeString(),
//       hasEnded
//     });
    
//     return hasEnded;
//   } catch (error) {
//     console.error('Error in shift end check:', error);
//     return true;
//   }
// }

// /**
//  * 🔥 AUTO ABSENT MARKING - Shift end par jo check-in nahi kiya unko absent mark karega
//  */
// export async function markAutoAbsent() {
//   try {
//     await connectDB();
//     const now = new Date();
//     const todayStart = new Date(now);
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date(todayStart);
//     todayEnd.setDate(todayEnd.getDate() + 1);

//     console.log('🎯 Starting Auto Absent Marking...', {
//       time: now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
//     });

//     // Step 1: Check holiday/weekly off
//     const [holiday, weeklyOff] = await Promise.all([
//       isHoliday(now),
//       isWeeklyOff(now)
//     ]);

//     if (holiday || weeklyOff) {
//       console.log('🎯 Skipping - Today is:', holiday?.name || weeklyOff?.day);
//       return { 
//         success: true, 
//         message: `Skipped - ${holiday ? 'Holiday' : 'Weekly Off'}`,
//         totalMarkedAbsent: 0 
//       };
//     }

//     // Step 2: Get all active users with shifts
//     const [activeAgents, activeUsers] = await Promise.all([
//       Agent.find({ isActive: true }).populate('shift'),
//       User.find({ isActive: true, userType: 'employee' }).populate('shift')
//     ]);

//     const allUsers = [
//       ...activeAgents.map(a => ({ ...a.toObject(), type: 'agent' })),
//       ...activeUsers.map(u => ({ ...u.toObject(), type: 'user' }))
//     ];

//     console.log(`🔍 Processing ${allUsers.length} users for auto absent`);

//     let totalMarkedAbsent = 0;
//     const results = [];

//     // Step 3: Process each user
//     for (const user of allUsers) {
//       if (!user.shift) continue;

//       const result = await processUserForAutoAbsent(user, todayStart, now);
//       if (result.markedAbsent) totalMarkedAbsent++;
//       results.push(result);
//     }

//     console.log(`✅ Auto Absent Completed: ${totalMarkedAbsent} users marked absent`);
    
//     return {
//       success: true,
//       totalMarkedAbsent,
//       results,
//       timestamp: now
//     };

//   } catch (error) {
//     console.error('❌ Auto Absent Error:', error);
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Process individual user for auto absent
//  */
// async function processUserForAutoAbsent(user, todayStart, currentTime) {
//   const userName = user.agentName || `${user.firstName} ${user.lastName}`;
//   const userId = user._id;
//   const userType = user.type; // 'agent' or 'user'
//   const shift = user.shift;

//   try {
//     // Check if today is working day
//     const isWorkingDay = await isShiftDay(shift._id, currentTime);
//     if (!isWorkingDay) {
//       return { userId, userName, markedAbsent: false, reason: 'Not working day' };
//     }

//     // Check if shift has ended
//     const shiftEnded = hasShiftEndedSmart(shift.endTime, currentTime);
//     if (!shiftEnded) {
//       return { userId, userName, markedAbsent: false, reason: 'Shift not ended yet' };
//     }

//     // Check if attendance already exists
//     const existingAttendance = await Attendance.findOne({
//       [userType]: userId,
//       $or: [
//         { date: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) } },
//         { createdAt: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) } },
//         { checkInTime: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) } }
//       ]
//     });

//     if (existingAttendance) {
//       return { 
//         userId, 
//         userName, 
//         markedAbsent: false, 
//         reason: `Already has attendance: ${existingAttendance.status}` 
//       };
//     }

//     // 🔥 MARK AS ABSENT - No check-in before shift end
//     const absentAttendance = await Attendance.create({
//       [userType]: userId,
//       shift: shift._id,
//       date: todayStart,
//       status: 'absent',
//       isLate: false,
//       lateMinutes: 0,
//       notes: `Auto-marked absent: No check-in before shift end (${shift.name})`,
//       autoMarked: true,
//       autoMarkedAt: new Date()
//     });

//     console.log(`❌ AUTO ABSENT: ${userName} - ${shift.name}`);

//     return { 
//       userId, 
//       userName, 
//       markedAbsent: true, 
//       attendanceId: absentAttendance._id,
//       shift: shift.name
//     };

//   } catch (error) {
//     console.error(`Error processing ${userName}:`, error);
//     return { userId, userName, markedAbsent: false, error: error.message };
//   }
// }

// /**
//  * 🔥 AUTO CHECKOUT - Check-in ke baad shift end par auto checkout
//  */
// export async function processAutoCheckout() {
//   try {
//     await connectDB();
//     const now = new Date();
//     const todayStart = new Date(now);
//     todayStart.setHours(0, 0, 0, 0);

//     console.log('🎯 Starting Auto Check-out...', {
//       time: now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
//     });

//     // Find attendance with check-in but no check-out
//     const pendingCheckouts = await Attendance.find({
//       $or: [
//         { date: { $gte: todayStart } },
//         { checkInTime: { $gte: todayStart } },
//         { createdAt: { $gte: todayStart } }
//       ],
//       checkInTime: { $exists: true, $ne: null },
//       checkOutTime: { $exists: false },
//       status: { $in: ['present', 'late'] }
//     })
//     .populate('shift')
//     .populate('agent')
//     .populate('user');

//     console.log(`🔍 Found ${pendingCheckouts.length} pending check-outs`);

//     let totalAutoCheckedOut = 0;
//     const results = [];

//     for (const attendance of pendingCheckouts) {
//       const result = await processAutoCheckoutForAttendance(attendance, now);
//       if (result.autoCheckedOut) totalAutoCheckedOut++;
//       results.push(result);
//     }

//     console.log(`✅ Auto Check-out Completed: ${totalAutoCheckedOut} users`);

//     return {
//       success: true,
//       totalAutoCheckedOut,
//       results,
//       timestamp: now
//     };

//   } catch (error) {
//     console.error('❌ Auto Check-out Error:', error);
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Process auto checkout for individual attendance
//  */
// async function processAutoCheckoutForAttendance(attendance, currentTime) {
//   const user = attendance.agent || attendance.user;
//   const userName = user?.agentName || `${user?.firstName} ${user?.lastName}` || 'Unknown';
//   const userType = attendance.agent ? 'agent' : 'user';

//   try {
//     // Check if shift has ended
//     if (!attendance.shift || !attendance.shift.endTime) {
//       return { 
//         attendanceId: attendance._id, 
//         userName, 
//         autoCheckedOut: false, 
//         reason: 'No shift info' 
//       };
//     }

//     const shiftEnded = hasShiftEndedSmart(attendance.shift.endTime, currentTime);
//     if (!shiftEnded) {
//       return { 
//         attendanceId: attendance._id, 
//         userName, 
//         autoCheckedOut: false, 
//         reason: 'Shift not ended yet' 
//       };
//     }

//     // Calculate working hours
//     const totalWorkingMinutes = getTimeDifferenceInMinutes(
//       attendance.checkInTime, 
//       currentTime
//     );

//     // Calculate overtime
//     let isOvertime = false;
//     let overtimeMinutes = 0;
    
//     if (attendance.shift) {
//       const shift = attendance.shift;
//       const checkInDate = new Date(attendance.checkInTime);
      
//       const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
//       let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
      
//       // Handle overnight shifts
//       if (shiftEnd <= shiftStart) {
//         shiftEnd.setDate(shiftEnd.getDate() + 1);
//       }

//       // Overtime calculation
//       if (currentTime > shiftEnd) {
//         isOvertime = true;
//         overtimeMinutes = getTimeDifferenceInMinutes(shiftEnd, currentTime);
//       }
//     }

//     // 🔥 UPDATE ATTENDANCE WITH AUTO CHECKOUT
//     attendance.checkOutTime = currentTime;
//     attendance.checkOutLocation = 'Auto-checkout: Shift ended';
//     attendance.totalWorkingMinutes = totalWorkingMinutes;
//     attendance.isOvertime = isOvertime;
//     attendance.overtimeMinutes = overtimeMinutes;
//     attendance.autoCheckedOut = true;
//     attendance.notes = `Auto checked-out at ${currentTime.toLocaleTimeString()}`;

//     await attendance.save();

//     console.log(`✅ AUTO CHECK-OUT: ${userName} - ${(totalWorkingMinutes/60).toFixed(1)} hours`);

//     return { 
//       attendanceId: attendance._id, 
//       userName, 
//       autoCheckedOut: true,
//       workingHours: (totalWorkingMinutes/60).toFixed(1),
//       overtimeMinutes 
//     };

//   } catch (error) {
//     console.error(`Error auto checkout for ${userName}:`, error);
//     return { 
//       attendanceId: attendance._id, 
//       userName, 
//       autoCheckedOut: false, 
//       error: error.message 
//     };
//   }
// }

// /**
//  * 🔥 COMBINED SERVICE - Dono kaam ek saath
//  */
// export async function runAutoAttendanceServices() {
//   try {
//     console.log('🚀 Starting Combined Auto Attendance Services...');
    
//     // Parallel processing for better performance
//     const [absentResult, checkoutResult] = await Promise.all([
//       markAutoAbsent(),
//       processAutoCheckout()
//     ]);

//     const totalProcessed = 
//       (absentResult.totalMarkedAbsent || 0) + 
//       (checkoutResult.totalAutoCheckedOut || 0);

//     console.log('🎉 All Auto Services Completed:', {
//       absentMarked: absentResult.totalMarkedAbsent,
//       autoCheckouts: checkoutResult.totalAutoCheckedOut,
//       totalProcessed
//     });

//     return {
//       success: true,
//       autoAbsent: absentResult,
//       autoCheckout: checkoutResult,
//       totalProcessed,
//       timestamp: new Date()
//     };

//   } catch (error) {
//     console.error('❌ Combined Auto Attendance Error:', error);
//     return { success: false, error: error.message };
//   }
// }

import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import Agent from "@/Models/Agent";
import User from "@/Models/User";
import { 
  isHoliday, 
  isWeeklyOff, 
  isShiftDay,
  getTimeDifferenceInMinutes,
  parseShiftDateTime
} from "@/lib/attendanceUtils";

const DEFAULT_TZ = "Asia/Karachi";

/**
 * 🔥 SMART SHIFT END CHECK - IMPROVED FOR MULTIPLE SHIFTS
 */
function hasShiftEndedSmart(shiftEndTime, currentTime, timezone = DEFAULT_TZ) {
  if (!shiftEndTime) return true;
  
  try {
    const [endHours, endMinutes] = shiftEndTime.split(':').map(Number);
    
    // Convert to target timezone
    const currentInTz = new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));
    const shiftEnd = new Date(currentInTz);
    shiftEnd.setHours(endHours, endMinutes, 0, 0);
    
    const hasEnded = currentInTz > shiftEnd;
    
    return hasEnded;
  } catch (error) {
    console.error('Error in shift end check:', error);
    return true;
  }
}

/**
 * 🔥 GET ALL ACTIVE SHIFTS - Sabhi shifts ko ek saath process karega
 */
async function getAllActiveShifts() {
  try {
    const shifts = await Shift.find({ isActive: true });
    console.log(`🔍 Found ${shifts.length} active shifts`);
    
    // Shift ke hisaab se group karega
    const shiftMap = {};
    shifts.forEach(shift => {
      shiftMap[shift._id] = shift;
    });
    
    return shiftMap;
  } catch (error) {
    console.error('Error getting shifts:', error);
    return {};
  }
}

/**
 * 🔥 BATCH PROCESS USERS BY SHIFT - Performance ke liye
 */
async function processUsersByShift(users, todayStart, currentTime, shiftMap) {
  let totalMarkedAbsent = 0;
  const results = [];

  // Har user ko uski shift ke hisaab se process karo
  for (const user of users) {
    if (!user.shift) continue;

    const shift = shiftMap[user.shift._id || user.shift];
    if (!shift) continue;

    const result = await processUserForAutoAbsent(user, shift, todayStart, currentTime);
    if (result.markedAbsent) totalMarkedAbsent++;
    results.push(result);
  }

  return { totalMarkedAbsent, results };
}

/**
 * 🔥 IMPROVED AUTO ABSENT MARKING - Multiple shifts support
 */
export async function markAutoAbsent() {
  try {
    await connectDB();
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    console.log('🎯 Starting Auto Absent Marking...', {
      time: now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
      date: todayStart.toDateString()
    });

    // Step 1: Check holiday/weekly off
    const [holiday, weeklyOff] = await Promise.all([
      isHoliday(now),
      isWeeklyOff(now)
    ]);

    if (holiday || weeklyOff) {
      console.log('🎯 Skipping - Today is:', holiday?.name || weeklyOff?.day);
      return { 
        success: true, 
        message: `Skipped - ${holiday ? 'Holiday' : 'Weekly Off'}`,
        totalMarkedAbsent: 0 
      };
    }

    // Step 2: Get all active shifts and users
    const [shiftMap, activeAgents, activeUsers] = await Promise.all([
      getAllActiveShifts(),
      Agent.find({ isActive: true }).populate('shift'),
      User.find({ isActive: true, userType: 'employee' }).populate('shift')
    ]);

    const allUsers = [
      ...activeAgents.map(a => ({ ...a.toObject(), type: 'agent' })),
      ...activeUsers.map(u => ({ ...u.toObject(), type: 'user' }))
    ];

    console.log(`🔍 Processing ${allUsers.length} users across ${Object.keys(shiftMap).length} shifts`);

    // Step 3: Process users by their shifts
    const { totalMarkedAbsent, results } = await processUsersByShift(
      allUsers, 
      todayStart, 
      now, 
      shiftMap
    );

    // Step 4: Show shift-wise summary
    const shiftSummary = {};
    results.forEach(result => {
      if (result.markedAbsent) {
        const shiftName = result.shift || 'Unknown';
        shiftSummary[shiftName] = (shiftSummary[shiftName] || 0) + 1;
      }
    });

    console.log(`✅ Auto Absent Completed: ${totalMarkedAbsent} users marked absent`);
    console.log('📊 Shift-wise Summary:', shiftSummary);
    
    return {
      success: true,
      totalMarkedAbsent,
      results,
      shiftSummary,
      timestamp: now
    };

  } catch (error) {
    console.error('❌ Auto Absent Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🔥 IMPROVED USER PROCESSING - Shift-specific logic
 */
async function processUserForAutoAbsent(user, shift, todayStart, currentTime) {
  const userName = user.agentName || `${user.firstName} ${user.lastName}`;
  const userId = user._id;
  const userType = user.type;

  try {
    // Check if today is working day for THIS shift
    const isWorkingDay = await isShiftDay(shift._id, currentTime);
    if (!isWorkingDay) {
      return { 
        userId, 
        userName, 
        shift: shift.name,
        markedAbsent: false, 
        reason: 'Not working day for this shift' 
      };
    }

    // Check if THIS shift has ended
    const shiftEnded = hasShiftEndedSmart(shift.endTime, currentTime);
    if (!shiftEnded) {
      return { 
        userId, 
        userName, 
        shift: shift.name,
        markedAbsent: false, 
        reason: 'Shift not ended yet' 
      };
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      [userType]: userId,
      $or: [
        { date: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) } },
        { createdAt: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) } },
        { checkInTime: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000) } }
      ]
    });

    if (existingAttendance) {
      return { 
        userId, 
        userName, 
        shift: shift.name,
        markedAbsent: false, 
        reason: `Already has attendance: ${existingAttendance.status}` 
      };
    }

    // 🔥 MARK AS ABSENT - No check-in before THIS shift end
    const absentAttendance = await Attendance.create({
      [userType]: userId,
      shift: shift._id,
      date: todayStart,
      status: 'absent',
      isLate: false,
      lateMinutes: 0,
      notes: `Auto-marked absent: No check-in before shift end (${shift.name} - ${shift.startTime} to ${shift.endTime})`,
      autoMarked: true,
      autoMarkedAt: new Date()
    });

    console.log(`❌ AUTO ABSENT: ${userName} - ${shift.name} (${shift.startTime} to ${shift.endTime})`);

    return { 
      userId, 
      userName, 
      shift: shift.name,
      markedAbsent: true, 
      attendanceId: absentAttendance._id,
      shiftTiming: `${shift.startTime} to ${shift.endTime}`
    };

  } catch (error) {
    console.error(`Error processing ${userName}:`, error);
    return { 
      userId, 
      userName, 
      shift: shift?.name || 'Unknown',
      markedAbsent: false, 
      error: error.message 
    };
  }
}

// /**
//  * 🔥 IMPROVED AUTO CHECKOUT - Multiple shifts support
//  */
// export async function processAutoCheckout() {
//   try {
//     await connectDB();
//     const now = new Date();
//     const todayStart = new Date(now);
//     todayStart.setHours(0, 0, 0, 0);

//     console.log('🎯 Starting Auto Check-out...', {
//       time: now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
//     });

//     // Find attendance with check-in but no check-out
//     const pendingCheckouts = await Attendance.find({
//       $or: [
//         { date: { $gte: todayStart } },
//         { checkInTime: { $gte: todayStart } },
//         { createdAt: { $gte: todayStart } }
//       ],
//       checkInTime: { $exists: true, $ne: null },
//       checkOutTime: { $exists: false },
//       status: { $in: ['present', 'late'] }
//     })
//     .populate('shift')
//     .populate('agent')
//     .populate('user');

//     console.log(`🔍 Found ${pendingCheckouts.length} pending check-outs across all shifts`);

//     let totalAutoCheckedOut = 0;
//     const results = [];
//     const shiftCheckoutSummary = {};

//     for (const attendance of pendingCheckouts) {
//       const result = await processAutoCheckoutForAttendance(attendance, now);
//       if (result.autoCheckedOut) {
//         totalAutoCheckedOut++;
        
//         // Shift-wise count rakho
//         const shiftName = attendance.shift?.name || 'Unknown';
//         shiftCheckoutSummary[shiftName] = (shiftCheckoutSummary[shiftName] || 0) + 1;
//       }
//       results.push(result);
//     }

//     console.log(`✅ Auto Check-out Completed: ${totalAutoCheckedOut} users`);
//     console.log('📊 Shift-wise Checkout Summary:', shiftCheckoutSummary);

//     return {
//       success: true,
//       totalAutoCheckedOut,
//       results,
//       shiftCheckoutSummary,
//       timestamp: now
//     };

//   } catch (error) {
//     console.error('❌ Auto Check-out Error:', error);
//     return { success: false, error: error.message };
//   }
// }

//
export async function processAutoCheckout() {
  try {
    await connectDB();
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    console.log('🎯 Starting Auto Check-out Service...', {
      time: now.toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })
    });

    // Find attendance with check-in but no check-out
    const pendingCheckouts = await Attendance.find({
      $or: [
        { date: { $gte: todayStart } },
        { checkInTime: { $gte: todayStart } }
      ],
      checkInTime: { $exists: true, $ne: null },
      checkOutTime: { $exists: false },
      status: { $in: ['present', 'late'] }
    })
    .populate('shift')
    .populate('agent')
    .populate('user');

    console.log(`🔍 Found ${pendingCheckouts.length} pending check-outs`);

    let totalAutoCheckedOut = 0;
    const results = [];

    for (const attendance of pendingCheckouts) {
      // Check if shift has ended
      if (!attendance.shift || !attendance.shift.endTime) continue;

      const shiftEnded = hasShiftEnded(attendance.shift.endTime, now);
      if (!shiftEnded) continue;

      const result = await performAutoCheckoutLogic(attendance, now);
      if (result.autoCheckedOut) totalAutoCheckedOut++;
      results.push(result);
    }

    console.log(`✅ Auto Check-out Service Completed: ${totalAutoCheckedOut} users`);

    return {
      success: true,
      totalAutoCheckedOut,
      results,
      timestamp: now
    };

  } catch (error) {
    console.error('❌ Auto Check-out Service Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Shift End Check
 */
function hasShiftEnded(shiftEndTime, currentTime, timezone = DEFAULT_TZ) {
  if (!shiftEndTime) return true;
  
  try {
    const [endHours, endMinutes] = shiftEndTime.split(':').map(Number);
    const currentInTz = new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));
    const shiftEnd = new Date(currentInTz);
    shiftEnd.setHours(endHours, endMinutes, 0, 0);
    
    return currentInTz > shiftEnd;
  } catch (error) {
    return true;
  }
}

/**
 * Auto Checkout Logic - Same as frontend API
 */
async function performAutoCheckoutLogic(attendance, currentTime) {
  const user = attendance.agent || attendance.user;
  const userName = user?.agentName || `${user?.firstName} ${user?.lastName}` || 'Unknown';

  try {
    // Set check-out details
    attendance.checkOutTime = currentTime;
    attendance.checkOutLocation = 'Auto-checkout: System Triggered';

    // Calculate working hours
    const totalWorkingMinutes = getTimeDifferenceInMinutes(
      attendance.checkInTime, 
      currentTime
    );

    // Calculate overtime
    let isOvertime = false;
    let overtimeMinutes = 0;
    
    if (attendance.shift) {
      const shift = attendance.shift;
      const checkInDate = new Date(attendance.checkInTime);
      
      const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
      let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
      
      // Handle overnight shifts
      if (shiftEnd <= shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      // Overtime calculation
      if (currentTime > shiftEnd) {
        isOvertime = true;
        overtimeMinutes = getTimeDifferenceInMinutes(shiftEnd, currentTime);
      }
    }

    // Update attendance status based on working hours
    let finalStatus = attendance.status;
    
    // Half day logic
    const requiredMinutesForFullDay = 4 * 60;
    if (totalWorkingMinutes < requiredMinutesForFullDay && totalWorkingMinutes > 0) {
      finalStatus = 'half_day';
    }

    // Update all fields
    attendance.totalWorkingMinutes = totalWorkingMinutes;
    attendance.isOvertime = isOvertime;
    attendance.overtimeMinutes = overtimeMinutes;
    attendance.status = finalStatus;
    attendance.autoCheckedOut = true;
    attendance.notes = `Auto checked-out by system at ${currentTime.toLocaleTimeString()}`;

    await attendance.save();

    console.log(`✅ SYSTEM AUTO CHECK-OUT: ${userName} - ${(totalWorkingMinutes/60).toFixed(1)} hours`);

    return { 
      attendanceId: attendance._id, 
      userName, 
      autoCheckedOut: true,
      workingHours: (totalWorkingMinutes/60).toFixed(1),
      overtimeMinutes,
      status: finalStatus
    };

  } catch (error) {
    console.error(`Error auto checkout for ${userName}:`, error);
    return { 
      attendanceId: attendance._id, 
      userName, 
      autoCheckedOut: false, 
      error: error.message 
    };
  }
}

/**
 * 🔥 IMPROVED AUTO CHECKOUT PROCESSING
 */
async function processAutoCheckoutForAttendance(attendance, currentTime) {
  const user = attendance.agent || attendance.user;
  const userName = user?.agentName || `${user?.firstName} ${user?.lastName}` || 'Unknown';
  const userType = attendance.agent ? 'agent' : 'user';
  const shiftName = attendance.shift?.name || 'Unknown';

  try {
    // Check if shift has ended
    if (!attendance.shift || !attendance.shift.endTime) {
      return { 
        attendanceId: attendance._id, 
        userName, 
        shift: shiftName,
        autoCheckedOut: false, 
        reason: 'No shift info' 
      };
    }

    const shiftEnded = hasShiftEndedSmart(attendance.shift.endTime, currentTime);
    if (!shiftEnded) {
      return { 
        attendanceId: attendance._id, 
        userName, 
        shift: shiftName,
        autoCheckedOut: false, 
        reason: 'Shift not ended yet' 
      };
    }

    // Calculate working hours
    const totalWorkingMinutes = getTimeDifferenceInMinutes(
      attendance.checkInTime, 
      currentTime
    );

    // Calculate overtime
    let isOvertime = false;
    let overtimeMinutes = 0;
    
    if (attendance.shift) {
      const shift = attendance.shift;
      const checkInDate = new Date(attendance.checkInTime);
      
      const shiftStart = parseShiftDateTime(checkInDate, shift.startTime);
      let shiftEnd = parseShiftDateTime(checkInDate, shift.endTime);
      
      // Handle overnight shifts
      if (shiftEnd <= shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      // Overtime calculation
      if (currentTime > shiftEnd) {
        isOvertime = true;
        overtimeMinutes = getTimeDifferenceInMinutes(shiftEnd, currentTime);
      }
    }

    // 🔥 UPDATE ATTENDANCE WITH AUTO CHECKOUT
    attendance.checkOutTime = currentTime;
    attendance.checkOutLocation = 'Auto-checkout: Shift ended';
    attendance.totalWorkingMinutes = totalWorkingMinutes;
    attendance.isOvertime = isOvertime;
    attendance.overtimeMinutes = overtimeMinutes;
    attendance.autoCheckedOut = true;
    attendance.notes = `Auto checked-out at ${currentTime.toLocaleTimeString()} (Shift: ${shiftName})`;

    await attendance.save();

    console.log(`✅ AUTO CHECK-OUT: ${userName} - ${shiftName} - ${(totalWorkingMinutes/60).toFixed(1)} hours`);

    return { 
      attendanceId: attendance._id, 
      userName, 
      shift: shiftName,
      autoCheckedOut: true,
      workingHours: (totalWorkingMinutes/60).toFixed(1),
      overtimeMinutes 
    };

  } catch (error) {
    console.error(`Error auto checkout for ${userName}:`, error);
    return { 
      attendanceId: attendance._id, 
      userName, 
      shift: shiftName,
      autoCheckedOut: false, 
      error: error.message 
    };
  }
}

/**
 * 🔥 COMBINED SERVICE - IMPROVED WITH SHIFT SUPPORT
 */
export async function runAutoAttendanceServices() {
  try {
    console.log('🚀 Starting Combined Auto Attendance Services...');
    
    // Parallel processing for better performance
    const [absentResult, checkoutResult] = await Promise.all([
      markAutoAbsent(),
      processAutoCheckout()
    ]);

    const totalProcessed = 
      (absentResult.totalMarkedAbsent || 0) + 
      (checkoutResult.totalAutoCheckedOut || 0);

    console.log('🎉 All Auto Services Completed:', {
      totalShifts: Object.keys(absentResult.shiftSummary || {}).length,
      absentMarked: absentResult.totalMarkedAbsent,
      autoCheckouts: checkoutResult.totalAutoCheckedOut,
      totalProcessed
    });

    // Detailed shift report
    console.log('📈 SHIFT-WISE REPORT:');
    console.log('- Absent by Shift:', absentResult.shiftSummary);
    console.log('- Checkouts by Shift:', checkoutResult.shiftCheckoutSummary);

    return {
      success: true,
      autoAbsent: absentResult,
      autoCheckout: checkoutResult,
      totalProcessed,
      shiftReport: {
        absentByShift: absentResult.shiftSummary,
        checkoutsByShift: checkoutResult.shiftCheckoutSummary
      },
      timestamp: new Date()
    };

  } catch (error) {
    console.error('❌ Combined Auto Attendance Error:', error);
    return { success: false, error: error.message };
  }
}