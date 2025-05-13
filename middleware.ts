import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const protectedRoute = createRouteMatcher([
  "/",
  "/upcoming",
  "/meeting(.*)",
  "/previous",
  "/recordings",
  "/personal-room",
  // The following pages are now excluded from this list:
  // "/services",
  // "/contact-us",
  // "/refunds-and-cancellations",
  // "/terms-and-conditions"
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
