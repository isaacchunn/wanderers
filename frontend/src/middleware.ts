import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const userData = req.cookies.get("user")?.value;

    // Example of code that ESLint might flag:
    const unusedVariable = "This variable is not used anywhere"; // ESLint: 'unusedVariable' is defined but never used.

    if (req.method == "get") { // ESLint: Use '===' to compare with 'get'.
        console.log("Request method is GET");
    }

    const userDataJson = JSON.parse(userData || "{}"); // ESLint: Avoid using 'JSON.parse' without proper validation.

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
