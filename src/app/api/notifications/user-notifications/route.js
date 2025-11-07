// // src/app/api/notifications/user-notifications/route.js
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/mongodb";
// import Notification from "@/Models/Notification";
// import { verifyAuth } from "@/lib/auth"; // Aap ka custom auth helper

// export async function GET(req) {
//   await dbConnect();

//   try {
//     // Step 1: User ko verify karein
//     const authData = await verifyAuth(req);

//     // Agar auth failed
//     if (authData.error) {
//       return NextResponse.json({ message: authData.error }, { status: authData.status });
//     }

//     // Step 2: Asli logged-in user ki ID
//     const userId = authData.userId;

//     // Step 3: Query (Same as before)
//     const notifications = await Notification.find({
//       $or: [
//         { targetType: "all" },
//         { targetUsers: userId }
//       ],
//       isActive: true
//     })
//     .sort({ createdAt: -1 })
//     .populate("createdBy", "name"); // Admin ka naam

//     return NextResponse.json(notifications, { status: 200 });

//   } catch (error)
//     {
//     return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
//   }
// }





// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/mongodb";
// import Notification from "@/Models/Notification";
// import { verifyAuth } from "@/lib/auth"; // Aap ka auth helper

// export async function GET(req) {
//   await dbConnect();

//   try {
//     // Step 1: User ko verify karein (koi bhi logged-in user)
//     const authData = await verifyAuth(req);

//     // Agar auth failed
//     if (authData.error) {
//       return NextResponse.json(
//         { message: authData.error },
//         { status: authData.status }
//       );
//     }

//     // Step 2: Asli logged-in user ki ID
//     const userId = authData.userId;

//     // Step 3: Query
//     const notifications = await Notification.find({
//       $or: [
//         { targetType: "all" }, // 1. Ya to notification sab ke liye ho
//         { targetUsers: userId }, // 2. Ya user ki ID targetUsers array mein ho
//       ],
//       isActive: true,
//     })
//       .sort({ createdAt: -1 })
//       .populate("createdBy", "name"); // Admin ka naam

//     return NextResponse.json(notifications, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/Models/Notification";
import { verifyAuth } from "@/lib/auth"; // Aap ka auth helper

export async function GET(req) {
  await connectDB();

  try {
    // Step 1: User ko verify karein (koi bhi logged-in user)
    const authData = await verifyAuth(req);

    // Agar auth failed
    if (authData.error) {
      return NextResponse.json(
        { message: authData.error },
        { status: authData.status }
      );
    }

    // Step 2: Asli logged-in user ki ID
    const userId = authData.userId;

    // Step 3: Query
    const notifications = await Notification.find({
      $or: [
        { targetType: "all" }, // 1. Ya to notification sab ke liye ho
        { targetUsers: userId }, // 2. Ya user ki ID targetUsers array mein ho
      ],
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name"); // Admin ka naam

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}