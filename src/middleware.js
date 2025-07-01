import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  /**
   * Defines an array of routes that should be publicly accessible.
   * By providing an empty array `[]`, you are stating that no application routes
   * are public by default. Clerk's own authentication routes (e.g., /sign-in, /sign-up)
   * are implicitly public and handled by Clerk.
   *
   * If a user is not authenticated and attempts to access any route matched by
   * the `config.matcher` below (and not part of Clerk's auth routes),
   * they will be automatically redirected to your Clerk sign-in page.
   *
   * If you had other public pages (e.g., a landing page, a public blog),
   * you would list their paths here, for example: `publicRoutes: ['/', '/blog/:path*']`.
   */
  publicRoutes: ["/"],

  /**
   * Optional: Defines an array of routes that should be ignored by Clerk's
   * authentication processing. This is useful for webhooks or other routes
   * that handle their own authentication.
   * Example: `ignoredRoutes: ['/api/webhook/some-service']`
   */
  // ignoredRoutes: [],
});

export const config = {
  matcher: [
    /**
     * This is a common and effective pattern for Next.js middleware.
     * It matches all routes EXCEPT:
     * 1. Next.js internal routes (e.g., `/_next/...`).
     * 2. Static files commonly found in the `public` directory or served as assets
     * (e.g., .css, .js (but not .json), .png, .svg, etc.).
     * The `[^?]*` part ensures it correctly handles query parameters.
     * This broad pattern ensures that most of your application pages and dynamic
     * API endpoints are processed by the middleware.
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    /**
     * This pattern explicitly ensures that all routes starting with `/api/` or `/trpc/`
     * are processed by the middleware. While the general pattern above might already
     * cover these, adding this provides an extra layer of certainty, especially for
     * critical API endpoints.
     */
    "/(api|trpc)(.*)",

    /**
     * This pattern specifically targets routes like `/project/123/board/some/path`.
     * It ensures these dynamic board-related routes are processed by the middleware.
     * If your first general pattern is correctly configured, this might be redundant,
     * but explicitly listing key protected route structures can be a good practice
     * for clarity and assurance.
     */
    "/project/:id/board/:path*",
  ],
};
