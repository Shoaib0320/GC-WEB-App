// import { NextResponse } from 'next/server';

// export async function POST() {
//   const response = NextResponse.json({
//     success: true,
//     message: 'Logged out successfully'
//   });

//   // Clear token cookie
//   response.cookies.set('token', '', {
//     httpOnly: true,
//     expires: new Date(0)
//   });

//   return response;
// }


// src/app/api/auth/logout/route.js
// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function POST(req) {
//   try {
//     // Cookie ko clear kar dein
//     cookies().set("token", "", {
//       httpOnly: true,
//       expires: new Date(0), 
//       path: "/",
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Logged out successfully",
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, error: "Logout failed" },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Pehle ek response object banayein
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // 2. Us response par cookie ko clear (expire) karein
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    // 3. Response ko return karein
    return response;

  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}