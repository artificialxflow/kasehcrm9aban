import { jsonResponse } from "@/lib/api-json";
import { listBranchesWithStats } from "@/lib/services/branches";
import { requirePanelAuth } from "@/lib/panel-auth";

export async function GET() {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  const branches = await listBranchesWithStats();
  return jsonResponse({ branches });
}
