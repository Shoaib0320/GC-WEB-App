import connectDB from "./mongodb";
import Attendance from "@/Models/Attendance";
import Holiday from "@/Models/Holiday";
import User from "@/Models/User";
import Agent from "@/Models/Agent";

export async function processAutoAttendance() {
  try {
    await connectDB();
    
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Check if today is holiday
    const isHoliday = await Holiday.findOne({
      date: { $gte: todayStart, $lt: todayEnd }
    });

    // Get all active users and agents
    const activeUsers = await User.find({ isActive: true }, "_id");
    const activeAgents = await Agent.find({ isActive: true }, "_id");

    const userIds = activeUsers.map(user => user._id);
    const agentIds = activeAgents.map(agent => agent._id);

    // Check existing attendance records for today
    const existingAttendance = await Attendance.find({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });

    const existingUserIds = existingAttendance
      .filter(a => a.user)
      .map(a => a.user.toString());
    
    const existingAgentIds = existingAttendance
      .filter(a => a.agent)
      .map(a => a.agent.toString());

    // Find users without attendance today
    const usersWithoutAttendance = userIds.filter(
      userId => !existingUserIds.includes(userId.toString())
    );

    // Find agents without attendance today
    const agentsWithoutAttendance = agentIds.filter(
      agentId => !existingAgentIds.includes(agentId.toString())
    );

    // Create absent records for users without attendance
    const userAttendancePromises = usersWithoutAttendance.map(userId => 
      Attendance.create({
        user: userId,
        status: isHoliday ? "holiday" : "absent",
        createdAt: today,
        updatedAt: today
      })
    );

    // Create absent records for agents without attendance
    const agentAttendancePromises = agentsWithoutAttendance.map(agentId => 
      Attendance.create({
        agent: agentId,
        status: isHoliday ? "holiday" : "absent",
        createdAt: today,
        updatedAt: today
      })
    );

    await Promise.all([...userAttendancePromises, ...agentAttendancePromises]);

    console.log(`Auto attendance processed: ${usersWithoutAttendance.length} users, ${agentsWithoutAttendance.length} agents marked as ${isHoliday ? 'holiday' : 'absent'}`);
    
    return {
      success: true,
      usersProcessed: usersWithoutAttendance.length,
      agentsProcessed: agentsWithoutAttendance.length,
      status: isHoliday ? 'holiday' : 'absent'
    };
  } catch (error) {
    console.error("Error processing auto attendance:", error);
    return { success: false, error: error.message };
  }
}