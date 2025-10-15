import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

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
    if (protectedRoute(req)) auth().protect()
  },
  {
    // authorizedParties: ['https://meet.krishnaconsciousnesssociety.com']
  },
)

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
