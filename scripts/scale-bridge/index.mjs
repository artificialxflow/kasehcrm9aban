/**
 * Scale bridge skeleton — run on branch All-in-One (not on Runflare).
 * Set env: API_BASE, BRANCH_ID=2, SCALE_API_KEY (if server requires it), SERIAL_PORT (phase 2).
 */
const API_BASE = process.env.API_BASE ?? "https://kasehcrm.runflare.ir";
const BRANCH_ID = process.env.BRANCH_ID ?? "2";
const SCALE_API_KEY = process.env.SCALE_API_KEY ?? "";

export async function postScaleEvent(rawPayload) {
  const headers = { "Content-Type": "application/json" };
  if (SCALE_API_KEY) headers["x-scale-api-key"] = SCALE_API_KEY;

  const res = await fetch(`${API_BASE}/api/branches/${BRANCH_ID}/scale-events`, {
    method: "POST",
    headers,
    body: JSON.stringify({ rawPayload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

// Demo: node index.mjs --demo
if (process.argv.includes("--demo")) {
  postScaleEvent({ barcode: "POT001|225|1289000", source: "USB" })
    .then((d) => console.log("OK", d))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
