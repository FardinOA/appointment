import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();
    const {
        data: { user },
    } = await supabase.auth.getUser(session?.access_token);
    let isAuth = false;

    if (session && user) {
        isAuth = true;
    }
    // If there's no session and the user is trying to access a protected route, redirect to login
    if (
        !isAuth &&
        req.nextUrl.pathname !== "/login" &&
        req.nextUrl.pathname !== "/register"
    ) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/login";
        return NextResponse.redirect(redirectUrl);
    }

    // If there's a session and the user is trying to access login or register, redirect to home
    if (isAuth && ["/login", "/register"].includes(req.nextUrl.pathname)) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/";
        return NextResponse.redirect(redirectUrl);
    }
    return res;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
