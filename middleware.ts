import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: [
    '/', 
    '/transformations/:id',
    '/plans',
    '/api/webhooks/clerk', 
    '/api/webhooks/stripe', 
    '/api/webhooks/lemonsqueezy'
  ]
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};