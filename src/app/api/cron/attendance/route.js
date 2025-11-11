import { runAutoAttendanceCron } from '@/lib/cronJobs';

export async function GET(request) {
  try {
    // Security check - only allow from Vercel Cron or with secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Vercel Cron Triggered - Auto Attendance');
    const result = await runAutoAttendanceCron();
    
    return Response.json({
      success: true,
      message: 'Auto attendance completed',
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Cron API Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}