import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/dashboard", "/chat"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*"],
};
