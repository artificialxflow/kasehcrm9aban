import { jsonResponse, errorResponse } from "@/lib/api-json";
import { getDashboardSummary } from "@/lib/services/dashboard";
import { requirePanelAuth } from "@/lib/panel-auth";

export async function GET() {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;
  try {
    const summary = await getDashboardSummary();
    return jsonResponse(summary);
  } catch {
    return errorResponse("DASHBOARD_FAILED", 500);
  }
}
