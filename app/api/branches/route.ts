import { jsonResponse } from "@/lib/api-json";
import { listBranchesWithStats } from "@/lib/services/branches";

export async function GET() {
  const branches = await listBranchesWithStats();
  return jsonResponse({ branches });
}
