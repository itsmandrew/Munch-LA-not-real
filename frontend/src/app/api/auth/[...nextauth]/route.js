import NextAuth from "next-auth/next";
import { authOptions } from "../../../../../library/auth_options";

const handler = NextAuth(authOptions)

// Export named handlers for HTTP methods
export const GET = handler;
export const POST = handler;