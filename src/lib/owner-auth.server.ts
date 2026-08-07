/**
 * Owner Authentication (Database-Based)
 *
 * Session cookies are HMAC-signed to prevent forgery.
 */

import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface OwnerSession {
  email: string;
  authenticatedAt: number;
}

function getSecret(): string {
  const secret = process.env.OWNER_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("OWNER_SESSION_SECRET is not configured");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Verify owner credentials against database
 */
export async function verifyOwnerCredentials(
  email: string,
  password: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_credentials")
      .select("password_hash")
      .eq("email", email)
      .single();

    if (error || !data) {
      console.error("Credentials not found in database");
      return false;
    }

    return await bcrypt.compare(password, data.password_hash);
  } catch (err) {
    console.error("Error verifying credentials:", err);
    return false;
  }
}

/**
 * Cookie attributes.
 * - HTTPS (preview / production, possibly embedded in an iframe): SameSite=None; Secure
 * - Plain HTTP (local development, e.g. http://localhost:3000): SameSite=Lax without Secure,
 *   because browsers drop `Secure` cookies on insecure origins.
 */
function cookieAttributes(request?: Request): string {
  let isHttps = true;
  if (request) {
    const forwarded = request.headers.get("x-forwarded-proto");
    isHttps = forwarded
      ? forwarded.split(",")[0]!.trim() === "https"
      : new URL(request.url).protocol === "https:";
  }
  return isHttps ? "Secure; SameSite=None" : "SameSite=Lax";
}

/**
 * Create signed owner session cookie
 */
export function createOwnerSessionCookie(email: string, request?: Request): string {
  const session: OwnerSession = {
    email,
    authenticatedAt: Date.now(),
  };

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);
  const value = `${payload}.${signature}`;

  const maxAge = 7 * 24 * 60 * 60;
  return `owner_session=${value}; Path=/; HttpOnly; ${cookieAttributes(request)}; Max-Age=${maxAge}`;
}

/**
 * Clear owner session cookie
 */
export function clearOwnerSessionCookie(request?: Request): string {
  return `owner_session=; Path=/; HttpOnly; ${cookieAttributes(request)}; Max-Age=0`;
}

/**
 * Get owner session from request (verifies HMAC signature)
 */
export function getOwnerSessionFromRequest(request: Request): OwnerSession | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  try {
    const cookies = cookieHeader.split(";").reduce((acc: Record<string, string>, cookie) => {
      const [key, ...rest] = cookie.trim().split("=");
      if (key && rest.length > 0) acc[key] = decodeURIComponent(rest.join("="));
      return acc;
    }, {});

    const raw = cookies.owner_session;
    if (!raw) return null;

    const idx = raw.lastIndexOf(".");
    if (idx <= 0) return null;

    const payload = raw.slice(0, idx);
    const signature = raw.slice(idx + 1);
    const expected = sign(payload);
    if (!safeEqual(signature, expected)) return null;

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as OwnerSession;
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

  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const age = Date.now() - session.authenticatedAt;

  return age >= 0 && age < maxAge;
}
