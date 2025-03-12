import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const userData = req.cookies.get("user")?.value;

    if (!userData && req.nextUrl.pathname !== "/") {
        return NextResponse.redirect(new URL("/", req.url));
    } else if (userData && req.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/home", req.url));
    }

    return NextResponse.next();
}

// Protect all routes except "/"
export const config = {
    matcher: [
        "/home",
        "/itinerary",
        "/itinerary/:path*",
        "/",
        "/create-itinerary",
    ],
};
