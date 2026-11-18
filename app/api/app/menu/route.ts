import { BranchConcept } from "@prisma/client";
import { jsonResponse } from "@/lib/api-json";
import { listCustomerMenuByConcept } from "@/lib/services/customer-menu";

const CONCEPTS = new Set<string>(Object.values(BranchConcept));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const concept = url.searchParams.get("concept")?.trim() ?? "";
  if (!concept || !CONCEPTS.has(concept)) {
    return jsonResponse({ ok: false, error: "invalid_concept" }, { status: 422 });
  }

  const items = await listCustomerMenuByConcept(concept as BranchConcept);
  return jsonResponse({
    ok: true,
    concept,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.priceRial,
    })),
  });
}