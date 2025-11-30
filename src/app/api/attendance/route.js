//app/api/attendance/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/Models/Attendance";
import Shift from "@/Models/Shift";
import { verifyToken } from "@/lib/jwt";
import User from "@/Models/User"; 
import Agent from "@/Models/Agent";

// app/api/attendance/route.js - Updated GET function
export async function GET(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userType = searchParams.get("userType") || "all";
    const status = searchParams.get("status") || "all";
    const date = searchParams.get("date") || "";
    const fromDateParam = searchParams.get("fromDate") || searchParams.get("startDate") || "";
    const toDateParam = searchParams.get("toDate") || searchParams.get("endDate") || "";
    const monthParam = searchParams.get("month") || "";

    const skip = (page - 1) * limit;

    // // Log all incoming parameters
    // console.log("📥 API Request Parameters:", {
    //   page,
    //   limit,
    //   userType,
    //   status,
    //   date,
    //   fromDateParam,
    //   toDateParam,
    //   monthParam,
    //   skip
    // });

    // Build filter query
    let filter = {};
    
    if (userType !== 'all') {
      if (userType === 'user') {
        filter.user = { $exists: true, $ne: null };
      } else if (userType === 'agent') {
        filter.agent = { $exists: true, $ne: null };
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    // SIMPLIFIED DATE FILTERING
    if (fromDateParam && toDateParam) {
      const startDate = new Date(fromDateParam);
      const endDate = new Date(toDateParam);
      
      // End date ko pure din ke liye set karo (23:59:59.999)
      endDate.setHours(23, 59, 59, 999);
      
      filter.date = {
        $gte: startDate,
        $lte: endDate
      };
      
      console.log('📅 Date range filter:', {
        fromDateParam,
        toDateParam,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
    } else if (monthParam) {
      const parts = String(monthParam).split('-');
      if (parts.length === 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        if (!Number.isNaN(year) && !Number.isNaN(month)) {
          const startDate = new Date(Date.UTC(year, month - 1, 1));
          const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
          
          filter.date = {
            $gte: startDate,
            $lte: endDate
          };
        }
      }
    } else if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      filter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    console.log("🔍 Final Filter:", JSON.stringify(filter, null, 2));

    // DEBUG: Pehle count check karo
    const totalCount = await Attendance.countDocuments(filter);
    console.log(`🔢 Total documents matching filter: ${totalCount}`);

    // DEBUG: Kuch sample documents bhi dekho
    if (totalCount > 0) {
      const sampleDocs = await Attendance.find(filter)
        .select('date user agent status checkInTime checkOutTime')
        .populate("user", "firstName lastName")
        .populate("agent", "agentName agentId")
        // .limit(3)
        .lean();
      
      console.log("📄 Sample documents:", sampleDocs.map(doc => ({
        date: doc.date,
        user: doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : null,
        agent: doc.agent ? doc.agent.agentName : null,
        status: doc.status,
        checkInTime: doc.checkInTime,
        checkOutTime: doc.checkOutTime
      })));
    }

    // Get records with proper population
    const records = await Attendance.find(filter)
      .populate("user", "firstName lastName email")
      .populate("agent", "agentName agentId email")
      .populate("shift", "name startTime endTime")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Attendance.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Final debug info
    console.log("📊 Final Response Info:", {
      totalRecords: total,
      currentPage: page,
      limit: limit,
      recordsReturned: records.length,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

    return NextResponse.json({ 
      success: true, 
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("❌ Attendance API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}