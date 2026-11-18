import { resolveBranchId } from "@/lib/branch-resolve";
import { jsonResponse } from "@/lib/api-json";
import { requirePanelAuth } from "@/lib/panel-auth";
import { scaleError } from "@/lib/scale-api-response";
import { listScaleAgentLogUploads, storeScaleAgentLogs } from "@/lib/services/scale-agent";

type RouteCtx = { params: Promise<{ branchId: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return scaleError("not_found", 404);

  const uploads = await listScaleAgentLogUploads(branch.id, 20);
  return jsonResponse({
    ok: true,
    uploads: uploads.map((u) => ({
      id: u.id,
      receivedAt: u.receivedAt,
      lineCount: Array.isArray(u.lines) ? (u.lines as unknown[]).length : 0,
    })),
  });
}

export async function POST(req: Request, ctx: RouteCtx) {
  const auth = await requirePanelAuth();
  if (auth instanceof Response) return auth;

  const { branchId: key } = await ctx.params;
  const branch = await resolveBranchId(key);
  if (!branch) return scaleError("not_found", 404);

  let body: { lines?: unknown[]; text?: string };
  try {
    body = (await req.json()) as { lines?: unknown[]; text?: string };
  } catch {
    return scaleError("validation", 422, { body: "invalid_json" });
  }

  let lines = body.lines;
  if (!lines?.length && typeof body.text === "string" && body.text.trim()) {
    lines = body.text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as unknown;
        } catch {
          return { raw: line };
        }
      });
  }

  if (!lines?.length) {
    return scaleError("validation", 422, { lines: "required_non_empty" });
  }
  if (lines.length > 500) {
    return scaleError("validation", 422, { lines: "max_500" });
  }

  try {
    const row = await storeScaleAgentLogs(branch.id, lines);
    return jsonResponse(
      { ok: true, id: row.id, count: lines.length },
      { status: 201 },
    );
  } catch {
    return scaleError("process_failed", 500);
  }
}