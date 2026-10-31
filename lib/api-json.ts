export function jsonResponse(data: unknown, init?: ResponseInit) {
  const body = JSON.stringify(data, (_key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
  return new Response(body, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}
