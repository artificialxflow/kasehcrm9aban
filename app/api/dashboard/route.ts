import { jsonResponse, errorResponse } from "@/lib/api-json";
import { getDashboardSummary } from "@/lib/services/dashboard";

export async function GET() {
  try {
    const summary = await getDashboardSummary();
    return jsonResponse(summary);
  } catch {
    return errorResponse("DASHBOARD_FAILED", 500);
  }
}
