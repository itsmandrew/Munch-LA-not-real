import NextAuth from "next-auth/next";
import { authOptions } from "../../../../../lib/auth_options";

const handler = NextAuth(authOptions)

// Export named handlers for HTTP methods
export const GET = handler;
export const POST = handler;