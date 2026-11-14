import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth;

  const needsAuth =
    path.startsWith("/admin") ||
    path.startsWith("/super-admin") ||
    path.startsWith("/account") ||
    path.startsWith("/checkout");

  if (needsAuth && !isLoggedIn) {
    const login = path.startsWith("/admin") || path.startsWith("/super-admin") ? "/staff" : "/login";
    const url = new URL(login, req.nextUrl.origin);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/staff", req.nextUrl.origin));
  }

  if (path.startsWith("/admin") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/staff", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/super-admin/:path*", "/account/:path*", "/checkout"],
};
