import { cookies } from "next/headers";
import { errorResponse } from "@/lib/api-json";
import { verifySessionToken, type PanelSessionPayload, SESSION_COOKIE } from "@/lib/panel-session";

export async function getPanelSession(): Promise<PanelSessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function requirePanelAuth(): Promise<PanelSessionPayload | Response> {
  const session = await getPanelSession();
  if (!session) return errorResponse("UNAUTHORIZED", 401);
  return session;
}
