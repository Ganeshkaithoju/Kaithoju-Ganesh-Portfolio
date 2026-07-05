/**
 * DEPRECATED: This file has been replaced with owner-auth.server.ts
 * 
 * This file is kept for reference only.
 * All new authentication uses owner-auth.server.ts instead.
 */

export interface AdminToken {
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export function generateAdminToken(): never {
  throw new Error("JWT authentication has been removed. Use owner-auth.server.ts instead.");
}

export function verifyAdminToken(): null {
  throw new Error("JWT authentication has been removed. Use owner-auth.server.ts instead.");
}

export async function verifyPassword(): Promise<never> {
  throw new Error("JWT authentication has been removed. Use owner-auth.server.ts instead.");
}

export async function hashPassword(): Promise<never> {
  throw new Error("JWT authentication has been removed. Use owner-auth.server.ts instead.");
}

export function getAdminTokenFromRequest(): null {
  throw new Error("JWT authentication has been removed. Use owner-auth.server.ts instead.");
}

export function createAdminCookie(): string {
  throw new Error("JWT authentication has been removed. Use owner-auth.server.ts instead.");
}

export function clearAdminCookie(): string {
  throw new Error("JWT authentication has been removed. Use owner-auth.server.ts instead.");
}
