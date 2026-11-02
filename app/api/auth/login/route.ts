import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { jsonResponse, errorResponse } from "@/lib/api-json";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/panel-session";
import type { UserRole } from "@/lib/types";
import type { StaffRole } from "@prisma/client";

function toUserRole(role: StaffRole): UserRole {
  return role as UserRole;
}

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return errorResponse("INVALID_JSON", 400);
  }

  const username = body.username?.trim();
  const password = body.password ?? "";
  if (!username || !password) return errorResponse("CREDENTIALS_REQUIRED", 400);

  const user = await prisma.staffUser.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return errorResponse("INVALID_CREDENTIALS", 401);
  }

  const token = await createSessionToken({
    userId: user.id,
    username: user.username,
    role: toUserRole(user.role),
  });

  const res = jsonResponse({
    ok: true,
    user: { username: user.username, role: user.role },
  });
  res.headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionCookieOptions().maxAge}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
  return res;
}
