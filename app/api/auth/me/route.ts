import { jsonResponse, errorResponse } from "@/lib/api-json";
import { getPanelSession } from "@/lib/panel-auth";

export async function GET() {
  const session = await getPanelSession();
  if (!session) return errorResponse("UNAUTHORIZED", 401);
  return jsonResponse({
    ok: true,
    user: { username: session.username, role: session.role },
  });
}
