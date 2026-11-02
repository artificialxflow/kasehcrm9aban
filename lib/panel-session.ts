import type { UserRole } from "@/lib/types";

export const SESSION_COOKIE = "kaseh_panel_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type PanelSessionPayload = {
  userId: string;
  username: string;
  role: UserRole;
  exp: number;
};

function sessionSecret(): string {
  const s = process.env.PANEL_SESSION_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    console.warn("PANEL_SESSION_SECRET missing — using insecure default");
  }
  return "dev-insecure-change-me";
}

function encodeBytes(data: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(data).toString("base64url");
  let binary = "";
  for (const b of data) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBytes(b64url: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64url, "base64url"));
  const pad = b64url.length % 4 === 0 ? "" : "=".repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return encodeBytes(new Uint8Array(sig));
}

export async function createSessionToken(input: {
  userId: string;
  username: string;
  role: UserRole;
}): Promise<string> {
  const payload: PanelSessionPayload = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const payloadB64 = encodeBytes(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmacSign(payloadB64, sessionSecret());
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<PanelSessionPayload | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacSign(payloadB64, sessionSecret());
  if (sig !== expected) return null;
  try {
    const json = new TextDecoder().decode(decodeBytes(payloadB64));
    const payload = JSON.parse(json) as PanelSessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeSec = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}
