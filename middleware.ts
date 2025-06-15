import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/api"];

export default clerkMiddleware((auth, req: NextRequest) => {

    const isPublic = publicRoutes.some((route) =>
        req.nextUrl.pathname.startsWith(route)
    );

    if (isPublic) {
        return NextResponse.next();
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};