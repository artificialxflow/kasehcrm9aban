import { jsonResponse } from "@/lib/api-json";
import { SESSION_COOKIE } from "@/lib/panel-session";

export async function POST() {
  const res = jsonResponse({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
  return res;
}
