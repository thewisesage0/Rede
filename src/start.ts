import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// h3 (the server used by Nitro/TanStack Start on every deployment target,
// Vercel included) sometimes swallows an in-handler throw into a generic
// JSON 500 response instead of letting it propagate as a catchable error.
// We check for that shape here so a real crash always renders our branded
// error page instead of a raw JSON blob, regardless of hosting provider.
function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const response = await next();

    const rawResponse = (response as { response?: Response })?.response ?? response;
    if (
      rawResponse instanceof Response &&
      rawResponse.status >= 500 &&
      (rawResponse.headers.get("content-type") ?? "").includes("application/json")
    ) {
      const body = await rawResponse.clone().text();
      if (isCatastrophicSsrErrorBody(body, rawResponse.status)) {
        console.error(`h3 swallowed SSR error: ${body}`);
        return brandedErrorResponse();
      }
    }

    return response;
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return brandedErrorResponse();
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
