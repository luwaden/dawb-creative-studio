import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "./auth";

export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

/** Wraps a route handler so thrown HttpErrors become clean JSON responses (no stack traces leak). */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      if (e instanceof ZodError) return json({ error: e.issues[0]?.message ?? "Invalid request" }, 400);
      if (e instanceof SyntaxError) return json({ error: "Malformed JSON body" }, 400);
      console.error("[api]", e);
      return json({ error: "Something went wrong on the server." }, 500);
    }
  };
}

export async function readJson<T = unknown>(req: Request, maxBytes = 5 * 1024 * 1024): Promise<T> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > maxBytes) throw new HttpError(413, "Request body too large");
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "Request body too large");
  return JSON.parse(text) as T;
}

/** Blocks cross-site form posts against cookie-authenticated endpoints. */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, "Cross-origin request blocked");
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(403, "Cross-origin request blocked");
  }
}
