/**
 * Owner Authentication (Database-Based)
 * 
 * Authentication now uses database for stored credentials.
 * Passwords are hashed with bcrypt for security.
 * Session stored in server-side cookies.
 */

import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface OwnerSession {
  email: string;
  authenticatedAt: number;
}

/**
 * Verify owner credentials against database
 */
export async function verifyOwnerCredentials(
  email: string,
  password: string
): Promise<boolean> {
  try {
    // Query database for admin credentials
    const { data, error } = await supabaseAdmin
      .from("admin_credentials")
      .select("password_hash")
      .eq("email", email)
      .single();

    if (error || !data) {
      console.error("Credentials not found in database");
      return false;
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, data.password_hash);
    return isPasswordValid;
  } catch (err) {
    console.error("Error verifying credentials:", err);
    return false;
  }
}

/**
 * Create owner session cookie
 */
export function createOwnerSessionCookie(email: string): string {
  const session: OwnerSession = {
    email,
    authenticatedAt: Date.now(),
  };

  // Encode session as base64
  const sessionData = Buffer.from(JSON.stringify(session)).toString("base64");

  // Return Set-Cookie header
  // 7 days expiry
  const maxAge = 7 * 24 * 60 * 60;
  return `owner_session=${sessionData}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

/**
 * Clear owner session cookie
 */
export function clearOwnerSessionCookie(): string {
  return "owner_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0";
}

/**
 * Get owner session from request
 */
export function getOwnerSessionFromRequest(request: Request): OwnerSession | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  try {
    const cookies = cookieHeader.split(";").reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

    const sessionData = cookies.owner_session;
    if (!sessionData) return null;

    const session = JSON.parse(Buffer.from(sessionData, "base64").toString("utf-8")) as OwnerSession;
    return session;
  } catch {
    return null;
  }
}

/**
 * Check if session is still valid (max 7 days)
 */
export function isSessionValid(session: OwnerSession | null): boolean {
  if (!session) return false;

  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const age = Date.now() - session.authenticatedAt;

  return age < maxAge;
}
