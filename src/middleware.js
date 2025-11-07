import { NextResponse } from "next/server";

export function middleware(req) {
  const res = NextResponse.next();
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // ✅ CORS (for all /api routes)
  if (pathname.startsWith("/api")) {
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res;
  }

  // ✅ Auth Protection (for dashboard)
  if (!token && pathname.startsWith("/dashboard")) {
    // If no token, redirect to login page
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Prevent logged-in users from accessing login page
  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

// ✅ Apply middleware to both API and Auth-protected routes
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/login"],
};
