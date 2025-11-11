import { runAutoAttendanceServices } from './autoAttendanceService';
import connectDB from '@/lib/mongodb';

/**
 * 🔥 MAIN CRON JOB - Ye automatically run hoga
 */
export async function runAutoAttendanceCron() {
  try {
    console.log('🔄 Starting Auto Attendance Cron Job...');
    await connectDB();
    
    const result = await runAutoAttendanceServices();
    
    console.log('✅ Auto Attendance Completed:', {
      timestamp: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
      absentMarked: result.autoAbsent?.totalMarkedAbsent || 0,
      autoCheckouts: result.autoCheckout?.totalAutoCheckedOut || 0
    });
    
    return result;
  } catch (error) {
    console.error('❌ Auto Attendance Cron Error:', error);
    return { success: false, error: error.message };
  }
}

// Manual trigger ke liye
export async function triggerManualAutoAttendance() {
  return await runAutoAttendanceCron();
}