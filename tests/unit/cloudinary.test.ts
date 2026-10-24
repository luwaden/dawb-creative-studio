import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { signParams } from "@/lib/server/cloudinary";

/** In-memory Cloudinary: checks signatures/basic auth and stores raw files. */
const SECRET = "test-secret";
const files = new Map<string, { data: Uint8Array; type: string }>();
let calls: string[] = [];

async function fakeFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const url = new URL(String(input));
  const path = url.pathname;
  calls.push(path);
  const verify = (p: Record<string, string>) => {
    const { signature, api_key, file, ...rest } = p;
    void file;
    return api_key === "123" && signature === signParams(rest, SECRET);
  };
  if (path.endsWith("/raw/upload")) {
    const form = init.body as FormData;
    const p: Record<string, string> = {};
    form.forEach((v, k) => { if (typeof v === "string") p[k] = v; });
    if (!verify(p) || p.type !== "authenticated") return new Response("{}", { status: 401 });
    const f = form.get("file") as Blob;
    files.set(p.public_id, { data: new Uint8Array(await f.arrayBuffer()), type: f.type });
    return Response.json({ public_id: p.public_id });
  }
  if (path.endsWith("/raw/download")) {
    const p = Object.fromEntries(url.searchParams);
    if (!verify(p)) return new Response("{}", { status: 401 });
    const f = files.get(p.public_id);
    return f ? new Response(new Blob([f.data as BlobPart]), { status: 200 }) : new Response("not found", { status: 404 });
  }
  if (path.endsWith("/raw/destroy")) {
    const p = Object.fromEntries(new URLSearchParams(String(init.body)));
    if (!verify(p)) return new Response("{}", { status: 401 });
    files.delete(p.public_id);
    return Response.json({ result: "ok" });
  }
  if (path.includes("/resources/raw/authenticated")) {
    const auth = new Headers(init.headers).get("authorization");
    if (auth !== `Basic ${Buffer.from(`123:${SECRET}`).toString("base64")}`) return new Response("{}", { status: 401 });
    const prefix = url.searchParams.get("prefix")!;
    return Response.json({ resources: [...files.keys()].filter((k) => k.startsWith(prefix)).map((public_id) => ({ public_id })) });
  }
  return new Response("{}", { status: 404 });
}

beforeAll(() => {
  process.env.CLOUDINARY_URL = `cloudinary://123:${SECRET}@dawbcloud`;
  process.env.CLOUDINARY_API_BASE = "http://cloudinary.fake";
  vi.stubGlobal("fetch", fakeFetch);
});
afterAll(() => {
  delete process.env.CLOUDINARY_URL;
  vi.unstubAllGlobals();
});

describe("cloudinary storage", () => {
  it("signs requests the way Cloudinary documents (sorted params + secret, SHA-1)", () => {
    // Example from Cloudinary's "Generating authentication signatures" docs.
    expect(signParams({ eager: "w_400,h_300,c_pad|w_260,h_200,c_crop", public_id: "sample_image", timestamp: 1315060510 }, "abcd")).toBe("bfd09f95f331f558cbd1320e67aa8d488770583e");
  });

  it("is selected automatically and becomes the shared workspace", async () => {
    const { getConfig } = await import("@/lib/server/config");
    expect(getConfig().driver).toBe("cloudinary");
    expect(getConfig().workspace).toBe("shared");
  });

  it("stores, lists, reads and deletes privately", async () => {
    const { cloudinaryConfig, CloudinaryStorage } = await import("@/lib/server/cloudinary");
    const s = new CloudinaryStorage(cloudinaryConfig()!, () => "image/png");
    await s.writeJSON("projects/meta/abc123.json", { id: "abc123", name: "Test" });
    await s.writeFile("assets/files/pic.png", Buffer.from([0x89, 0x50, 0x4e, 0x47]), "image/png");
    expect([...files.keys()]).toEqual(["dawb-studio/projects/meta/abc123.json", "dawb-studio/assets/files/pic.png"]);
    expect(await s.list("projects/meta")).toEqual(["projects/meta/abc123.json"]);
    expect(await s.readJSON("projects/meta/abc123.json")).toEqual({ id: "abc123", name: "Test" });
    expect(await s.readJSON("projects/meta/missing.json")).toBeNull();
    const f = await s.readFile("assets/files/pic.png");
    expect(f?.contentType).toBe("image/png");
    expect(Buffer.from(await new Response(f!.body).arrayBuffer())[1]).toBe(0x50);
    await s.remove("projects/meta/abc123.json");
    expect(await s.list("projects/meta")).toEqual([]);
  });

  it("caches listings briefly to stay inside the Admin API limit", async () => {
    const { cloudinaryConfig, CloudinaryStorage } = await import("@/lib/server/cloudinary");
    const s = new CloudinaryStorage(cloudinaryConfig()!, () => "application/json");
    calls = [];
    await s.list("assets/meta");
    await s.list("assets/meta");
    expect(calls.filter((c) => c.includes("/resources/")).length).toBe(1);
  });

  it("reports bad credentials clearly", async () => {
    const { CloudinaryStorage } = await import("@/lib/server/cloudinary");
    const s = new CloudinaryStorage({ cloud: "dawbcloud", key: "123", secret: "wrong", folder: "dawb-studio" }, () => "application/json");
    await expect(s.writeJSON("projects/meta/x.json", {})).rejects.toThrow(/Cloudinary rejected the credentials/);
  });
});
