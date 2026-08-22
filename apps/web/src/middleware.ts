import createMiddleware from "next-intl/middleware";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Clerk is optional in local/demo mode: without keys the app runs
// with the demo athlete and no auth wall.
const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_"));

export default hasClerk
  ? clerkMiddleware((_auth, req) => intlMiddleware(req))
  : intlMiddleware;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
