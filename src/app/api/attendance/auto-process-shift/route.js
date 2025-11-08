// // // src/app/api/attendance/auto-process-shift/route.js
// src/app/api/attendance/auto-process-smart/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/Models/User";
import Agent from "@/Models/Agent";
import { verifyToken } from "@/lib/jwt";
import {
  isHoliday,
  isWeeklyOff,
  getUsersWithoutAttendance,
  batchCreateAttendanceRecords,
  shouldMarkAbsentSmart
} from "@/lib/attendanceUtils";

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { date, userType = "all" } = body;

    const processDate = date ? new Date(date) : new Date();
    const today = new Date();
    const isFutureDate = processDate > today;
    
    console.log(`=== SMART AUTO ATTENDANCE PROCESSING ===`);
    console.log(`Processing Date: ${processDate.toDateString()}`);
    console.log(`Today's Date: ${today.toDateString()}`);
    console.log(`Is Future Date: ${isFutureDate}`);

    // 🔥 FUTURE DATE PROTECTION
    if (isFutureDate) {
      return NextResponse.json({
        success: false,
        message: `Cannot process auto attendance for future dates. Selected: ${processDate.toDateString()}`,
        data: {
          processDate: processDate.toISOString().split('T')[0],
          today: today.toISOString().split('T')[0],
          isFutureDate: true
        }
      }, { status: 400 });
    }

    // Check holiday/weekly off
    const weeklyOff = await isWeeklyOff(processDate);
    const holiday = await isHoliday(processDate);

    console.log(`Holiday: ${holiday ? holiday.name : 'No'}, Weekly Off: ${weeklyOff ? weeklyOff.name : 'No'}`);

    // Get active users and agents
    let activeUsers = [];
    let activeAgents = [];

    if (userType === "all" || userType === "user") {
      activeUsers = await User.find({ isActive: true });
      console.log(`Found ${activeUsers.length} active users`);
    }

    if (userType === "all" || userType === "agent") {
      activeAgents = await Agent.find({ isActive: true }).populate("shift");
      console.log(`Found ${activeAgents.length} active agents`);
    }

    // Get users/agents without attendance
    const withoutAttendanceResult = await getUsersWithoutAttendance(
      activeUsers, activeAgents, processDate, userType
    );

    if (!withoutAttendanceResult.success) {
      throw new Error(withoutAttendanceResult.error);
    }

    const { usersWithoutAttendance, agentsWithoutAttendance } = withoutAttendanceResult.data;

    console.log(`Users without attendance: ${usersWithoutAttendance.length}`);
    console.log(`Agents without attendance: ${agentsWithoutAttendance.length}`);

    // Prepare attendance documents using SMART LOGIC
    const attendanceDocs = [];
    const skippedRecords = [];

    // Process users
    for (const user of usersWithoutAttendance) {
      const shouldAbsent = await shouldMarkAbsentSmart(user, holiday, weeklyOff, processDate);
      
      if (!shouldAbsent) {
        skippedRecords.push({
          type: 'user',
          name: `${user.firstName} ${user.lastName}`,
          reason: 'Shift not applicable or not ended',
          shift: user.shift?.name
        });
        continue;
      }

      const userStatus = holiday ? 'holiday' : weeklyOff ? 'weekly_off' : 'absent';
      const userNotes = holiday 
        ? `Auto-marked as holiday: ${holiday.name}`
        : weeklyOff 
        ? `Auto-marked as weekly off: ${weeklyOff.name}`
        : `Auto-marked as absent (no check-in)`;

      console.log(`✅ [SMART] Creating attendance for USER: ${user.firstName} ${user.lastName}, Status: ${userStatus}`);

      attendanceDocs.push({
        user: user._id,
        shift: user.shift?._id || null,
        status: userStatus,
        notes: userNotes,
        date: processDate,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Process agents
    for (const agent of agentsWithoutAttendance) {
      const shouldAbsent = await shouldMarkAbsentSmart(agent, holiday, weeklyOff, processDate);
      
      if (!shouldAbsent) {
        skippedRecords.push({
          type: 'agent',
          name: agent.agentName,
          reason: 'Shift not applicable or not ended',
          shift: agent.shift?.name
        });
        continue;
      }

      const agentStatus = holiday ? 'holiday' : weeklyOff ? 'weekly_off' : 'absent';
      const agentNotes = holiday 
        ? `Auto-marked as holiday: ${holiday.name}`
        : weeklyOff 
        ? `Auto-marked as weekly off: ${weeklyOff.name}`
        : `Auto-marked as absent (no check-in)`;

      console.log(`✅ [SMART] Creating attendance for AGENT: ${agent.agentName}, Status: ${agentStatus}`);

      attendanceDocs.push({
        agent: agent._id,
        shift: agent.shift?._id || null,
        status: agentStatus,
        notes: agentNotes,
        date: processDate,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log(`📊 SMART Summary: ${attendanceDocs.length} to create, ${skippedRecords.length} skipped`);

    // Batch create records
    const batchResult = await batchCreateAttendanceRecords(attendanceDocs, {
      checkExisting: true,
      ordered: false
    });

    return NextResponse.json({
      success: true,
      message: `Smart auto attendance processed for ${processDate.toDateString()}`,
      data: {
        date: processDate.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
        isPastDate: processDate < today,
        isToday: processDate.toDateString() === today.toDateString(),
        batchSummary: batchResult.summary,
        skippedRecords: skippedRecords.length,
        status: holiday ? 'holiday' : weeklyOff ? 'weekly_off' : 'absent',
        holidayName: holiday ? holiday.name : null,
        weeklyOffName: weeklyOff ? weeklyOff.name : null
      }
    });

  } catch (error) {
    console.error("❌ SMART Auto Attendance Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message
    }, { status: 500 });
  }
}