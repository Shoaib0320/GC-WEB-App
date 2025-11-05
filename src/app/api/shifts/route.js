// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Shift from "@/models/Shift";

// export async function GET() {
//   try {
//     await connectDB();

//     const shifts = await Shift.find()
//       .populate("manager", "firstName lastName email")
//       .sort({ createdAt: -1 });

//     return NextResponse.json({
//       success: true,
//       data: shifts,
//     });
//   } catch (error) {
//     console.error("GET /api/shifts error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch shifts", details: error.message },
//       { status: 500 }
//     );
//   }
// }

// app/api/shifts/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Shift from "@/Models/Shift";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim(); // search query
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10); // default 10
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1; // default desc

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { days: { $regex: q, $options: "i" } },
        // { hours: isNaN(Number(q)) ? null : Number(q) }, // optional numeric search
      ].filter(Boolean);
      // Also search manager name requires lookup; we will fetch all and filter manager name in aggregation below
    }

    // Count total with optional manager name search handled via aggregate if q used for manager
    // We'll use aggregation to support searching manager's name too.
    const match = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { days: { $regex: q, $options: "i" } },
            // { hours: isNaN(Number(q)) ? -99999 : Number(q) }, // won't match if NaN
            { "managerDoc.firstName": { $regex: q, $options: "i" } },
            { "managerDoc.lastName": { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const aggregatePipeline = [
      {
        $lookup: {
          from: "users",
          localField: "manager",
          foreignField: "_id",
          as: "managerDoc",
        },
      },
      { $unwind: { path: "$managerDoc", preserveNullAndEmptyArrays: true } },
      { $match: match },
      {
        $project: {
          name: 1,
          startTime: 1,
          endTime: 1,
          // hours: 1,
          days: 1,
          // manager: {
          //   _id: "$managerDoc._id",
          //   firstName: "$managerDoc.firstName",
          //   lastName: "$managerDoc.lastName",
          //   email: "$managerDoc.email",
          // },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { [sortBy]: sortOrder } },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ];

    const aggRes = await Shift.aggregate(aggregatePipeline);

    const data = (aggRes[0] && aggRes[0].data) || [];
    const total = (aggRes[0] && aggRes[0].meta && aggRes[0].meta[0] && aggRes[0].meta[0].total) || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data,
      meta: { total, totalPages, page, limit },
    });
  } catch (error) {
    console.error("GET /api/shifts error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, startTime, endTime,  days } = body;

    if (!name || !startTime || !endTime || !days) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const shift = await Shift.create({
      name,
      startTime,
      endTime,
      // hours,
      days: Array.isArray(days) ? days : (days ? [days] : []),
      // manager: manager || null,
    });

    // populate manager for immediate return
    // const populated = await Shift.findById(shift._id).populate( "firstName lastName email");

    return NextResponse.json({ success: true, message: "Shift created", 
      // data: populated
     }, { status: 201 });
  } catch (error) {
    console.error("POST /api/shifts error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
