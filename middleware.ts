import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const protectedRoute = createRouteMatcher([
  "/home",
  "/meeting(.*)",
  "/recording",
  "/recordings",
  "/personal-room",
  "/attendance",
  "/admin-attendance",
])

export default clerkMiddleware(
  (auth, req) => {
    // If a user is logged in and they visit the landing page, redirect them to the home page.
    if (auth().userId && req.nextUrl.pathname === "/") {
      const homeUrl = new URL("/home", req.url)
      return NextResponse.redirect(homeUrl)
    }

    // Protect the routes that require authentication.
    if (protectedRoute(req)) auth().protect()
  },
  {
    // authorizedParties: ['https://meet.krishnaconsciousnesssociety.com']
  },
)

export const config = {
  matcher: ["/((?!.+\.[\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
