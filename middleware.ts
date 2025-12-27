import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/home(.*)",
  "/meeting(.*)",
  "/recording(.*)",
  "/recordings(.*)",
  "/personal-room(.*)",
  "/attendance(.*)",
  "/admin-attendance(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const session = await auth()
  const path = req.nextUrl.pathname

  // If a user is logged in and they visit the landing page, redirect them to the home page.
  if (session.userId && path === "/") {
    return NextResponse.redirect(new URL("/home", req.url))
  }

  // Protect the routes that require authentication.
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
