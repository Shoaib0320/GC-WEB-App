// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Attendance from "@/Models/Attendance";
// import Holiday from "@/Models/Holiday";
// import User from "@/Models/User";
// import Agent from "@/Models/Agent";
// import { verifyToken } from "@/lib/jwt";

// export async function POST(request) {
//   try {
//     await connectDB();

//     const token = request.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

//     const decoded = verifyToken(token);
//     if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

//     const body = await request.json();
//     const { date } = body;

//     const processDate = date ? new Date(date) : new Date();
//     const dateStart = new Date(processDate);
//     dateStart.setHours(0, 0, 0, 0);
//     const dateEnd = new Date(dateStart);
//     dateEnd.setDate(dateEnd.getDate() + 1);

//     // Check if the date is holiday
//     const isHoliday = await Holiday.findOne({
//       date: { $gte: dateStart, $lt: dateEnd }
//     });

//     // Get all active users and agents
//     const activeUsers = await User.find({ isActive: true }, "_id firstName lastName email");
//     const activeAgents = await Agent.find({ isActive: true }, "_id agentName agentId email");

//     const userIds = activeUsers.map(user => user._id);
//     const agentIds = activeAgents.map(agent => agent._id);

//     // Check existing attendance records for the date
//     const existingAttendance = await Attendance.find({
//       createdAt: { $gte: dateStart, $lt: dateEnd }
//     });

//     const existingUserIds = existingAttendance
//       .filter(a => a.user)
//       .map(a => a.user.toString());
    
//     const existingAgentIds = existingAttendance
//       .filter(a => a.agent)
//       .map(a => a.agent.toString());

//     // Find users without attendance for the date
//     const usersWithoutAttendance = userIds.filter(
//       userId => !existingUserIds.includes(userId.toString())
//     );

//     // Find agents without attendance for the date
//     const agentsWithoutAttendance = agentIds.filter(
//       agentId => !existingAgentIds.includes(agentId.toString())
//     );

//     // Create absent/holiday records for users without attendance
//     const userAttendancePromises = usersWithoutAttendance.map(userId => {
//       const user = activeUsers.find(u => u._id.toString() === userId.toString());
//       return Attendance.create({
//         user: userId,
//         status: isHoliday ? "holiday" : "absent",
//         notes: isHoliday ? `Auto-marked as holiday: ${isHoliday.name}` : "Auto-marked as absent (no check-in)",
//         createdAt: processDate,
//         updatedAt: new Date()
//       });
//     });

//     // Create absent/holiday records for agents without attendance
//     const agentAttendancePromises = agentsWithoutAttendance.map(agentId => {
//       const agent = activeAgents.find(a => a._id.toString() === agentId.toString());
//       return Attendance.create({
//         agent: agentId,
//         status: isHoliday ? "holiday" : "absent",
//         notes: isHoliday ? `Auto-marked as holiday: ${isHoliday.name}` : "Auto-marked as absent (no check-in)",
//         createdAt: processDate,
//         updatedAt: new Date()
//       });
//     });

//     const results = await Promise.allSettled([
//       ...userAttendancePromises,
//       ...agentAttendancePromises
//     ]);

//     const successfulRecords = results.filter(result => result.status === 'fulfilled').length;
//     const failedRecords = results.filter(result => result.status === 'rejected').length;

//     console.log(`Auto attendance processed for ${processDate.toDateString()}: ${successfulRecords} records created, ${failedRecords} failed`);

//     return NextResponse.json({
//       success: true,
//       message: `Auto attendance processed successfully for ${processDate.toDateString()}`,
//       data: {
//         date: processDate.toISOString().split('T')[0],
//         usersProcessed: usersWithoutAttendance.length,
//         agentsProcessed: agentsWithoutAttendance.length,
//         totalRecordsCreated: successfulRecords,
//         failedRecords: failedRecords,
//         status: isHoliday ? 'holiday' : 'absent',
//         holidayName: isHoliday ? isHoliday.name : null
//       }
//     });
//   } catch (error) {
//     console.error("POST /api/attendance/auto-process error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       message: error.message 
//     }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Holiday from "@/Models/Holiday";
import WeeklyOff from "@/Models/WeeklyOff";
import User from "@/Models/User";
import Agent from "@/Models/Agent";
import { verifyToken } from "@/lib/jwt";

// Function to check if date is weekly off
async function isWeeklyOff(date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const weeklyOff = await WeeklyOff.findOne({ 
    day: dayName, 
    isActive: true 
  });
  return weeklyOff;
}

// Function to check if date is holiday
async function isHoliday(date) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const holiday = await Holiday.findOne({
    $or: [
      // Exact date match
      { date: { $gte: dateStart, $lt: dateEnd } },
      // Recurring holidays (check month and day)
      { 
        isRecurring: true,
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, date.getMonth() + 1] },
            { $eq: [{ $dayOfMonth: "$date" }, date.getDate()] }
          ]
        }
      }
    ]
  });
  return holiday;
}

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

  const body = await request.json();
  const { date, userType } = body;

    const processDate = date ? new Date(date) : new Date();
    const dateStart = new Date(processDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    // Check if the date is weekly off
    const weeklyOff = await isWeeklyOff(processDate);
    
    // Check if the date is holiday
    const holiday = await isHoliday(processDate);

    // Determine status
    let status = "absent";
    let notes = "Auto-marked as absent (no check-in)";

    if (holiday) {
      status = "holiday";
      notes = `Auto-marked as holiday: ${holiday.name}`;
    } else if (weeklyOff) {
      status = "weekly_off";
      notes = `Auto-marked as weekly off: ${weeklyOff.name}`;
    }

  // Get all active users and agents (can be filtered by userType)
  const activeUsers = userType === 'agent' ? [] : await User.find({ isActive: true }, "_id firstName lastName email");
  const activeAgents = await Agent.find({ isActive: true }, "_id agentName agentId email");

    const userIds = activeUsers.map(user => user._id);
    const agentIds = activeAgents.map(agent => agent._id);

    // Check existing attendance records for the date
    const existingAttendance = await Attendance.find({
      createdAt: { $gte: dateStart, $lt: dateEnd }
    });

    const existingUserIds = existingAttendance
      .filter(a => a.user)
      .map(a => a.user.toString());
    
    const existingAgentIds = existingAttendance
      .filter(a => a.agent)
      .map(a => a.agent.toString());

    // Find users without attendance for the date
    const usersWithoutAttendance = userIds.filter(
      userId => !existingUserIds.includes(userId.toString())
    );

    // Find agents without attendance for the date
    const agentsWithoutAttendance = agentIds.filter(
      agentId => !existingAgentIds.includes(agentId.toString())
    );

    // Create records for users without attendance (skip when userType==='agent')
    const userAttendancePromises = (userType === 'agent' ? [] : usersWithoutAttendance.map(userId => {
      const user = activeUsers.find(u => u._id.toString() === userId.toString());
      return Attendance.create({
        user: userId,
        status: status,
        notes: notes,
        createdAt: processDate,
        updatedAt: new Date()
      });
    }));

    // Create records for agents without attendance
    const agentAttendancePromises = agentsWithoutAttendance.map(agentId => {
      const agent = activeAgents.find(a => a._id.toString() === agentId.toString());
      return Attendance.create({
        agent: agentId,
        status: status,
        notes: notes,
        createdAt: processDate,
        updatedAt: new Date()
      });
    });

    const results = await Promise.allSettled([
      ...userAttendancePromises,
      ...agentAttendancePromises
    ]);

    const successfulRecords = results.filter(result => result.status === 'fulfilled').length;
    const failedRecords = results.filter(result => result.status === 'rejected').length;

    console.log(`Auto attendance processed for ${processDate.toDateString()}: ${successfulRecords} records created, ${failedRecords} failed`);

    return NextResponse.json({
      success: true,
      message: `Auto attendance processed successfully for ${processDate.toDateString()}`,
      data: {
        date: processDate.toISOString().split('T')[0],
        usersProcessed: userType === 'agent' ? 0 : usersWithoutAttendance.length,
        agentsProcessed: agentsWithoutAttendance.length,
        totalRecordsCreated: successfulRecords,
        failedRecords: failedRecords,
        status: status,
        holidayName: holiday ? holiday.name : null,
        weeklyOffName: weeklyOff ? weeklyOff.name : null
      }
    });
  } catch (error) {
    console.error("POST /api/attendance/auto-process error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}