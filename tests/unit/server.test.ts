import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createFsStorage } from "@/lib/server/storage";
import { Repo } from "@/lib/server/repo";
import { HttpError, isEmailAllowed, type AppUser } from "@/lib/server/auth";
import { sniffMedia } from "@/lib/server/sniff";
import { getTemplate } from "@/lib/templates";

const dirs: string[] = [];
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "dawb-test-")); dirs.push(d); return d; };
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

const ada: AppUser = { email: "ada@dawblearn.org", name: "Ada", isAdmin: false };
const bola: AppUser = { email: "bola@dawblearn.org", name: "Bola", isAdmin: false };
const admin: AppUser = { email: "admin@dawblearn.org", name: "Admin", isAdmin: true };
const designDoc = () => { const t = getTemplate("p11-smallpox"); if (t?.kind !== "design") throw new Error(); return t.build(); };

describe("fs storage", () => {
  it("round-trips JSON and rejects path traversal", async () => {
    const s = createFsStorage(tmp());
    await s.writeJSON("projects/meta/a.json", { x: 1 });
    expect(await s.readJSON("projects/meta/a.json")).toEqual({ x: 1 });
    expect(await s.list("projects/meta")).toEqual(["projects/meta/a.json"]);
    expect(await s.readJSON("projects/meta/missing.json")).toBeNull();
    await expect(s.writeJSON("../escape.json", {})).rejects.toThrow();
    await expect(s.readJSON("projects/../../etc/passwd")).rejects.toThrow();
  });
});

describe("project repository", () => {
  let repo: Repo;
  beforeEach(() => { repo = new Repo(createFsStorage(tmp())); });

  it("creates, lists, updates and reopens a project with its editable structure", async () => {
    const meta = await repo.createProject(ada, { kind: "design", name: "Smallpox", templateId: "p11-smallpox", doc: designDoc() });
    expect((await repo.listProjects()).map((p) => p.id)).toEqual([meta.id]);
    const doc = designDoc();
    (doc.pages[0].elements.find((e) => e.label === "Statement") as { text: string }).text = "Edited";
    const updated = await repo.updateProject(bola, meta.id, { doc, baseRevision: 1 });
    expect(updated.revision).toBe(2);
    expect(updated.updatedBy.email).toBe(bola.email);
    const reopened = await repo.getProject(meta.id);
    expect(JSON.stringify(reopened.doc)).toContain("Edited");
  });

  it("rejects stale saves with 409 so teammates don't overwrite each other", async () => {
    const meta = await repo.createProject(ada, { kind: "design", name: "X", templateId: null, doc: designDoc() });
    await repo.updateProject(ada, meta.id, { name: "First", baseRevision: 1 });
    await expect(repo.updateProject(bola, meta.id, { name: "Second", baseRevision: 1 })).rejects.toMatchObject({ status: 409 });
    expect((await repo.updateProject(bola, meta.id, { name: "Forced", baseRevision: 1, force: true })).name).toBe("Forced");
  });

  it("validates documents on the server", async () => {
    await expect(repo.createProject(ada, { kind: "design", name: "Bad", templateId: null, doc: { version: 1, pages: [] } })).rejects.toBeInstanceOf(HttpError);
    await expect(repo.createProject(ada, { kind: "video", name: "Bad", templateId: null, doc: designDoc() })).rejects.toBeInstanceOf(HttpError);
  });

  it("only lets the creator or an admin delete", async () => {
    const meta = await repo.createProject(ada, { kind: "design", name: "Mine", templateId: null, doc: designDoc() });
    await expect(repo.deleteProject(bola, meta.id)).rejects.toMatchObject({ status: 403 });
    await repo.deleteProject(admin, meta.id);
    await expect(repo.getProject(meta.id)).rejects.toMatchObject({ status: 404 });
  });

  it("duplicates projects and toggles per-user favourites", async () => {
    const meta = await repo.createProject(ada, { kind: "design", name: "Orig", templateId: null, doc: designDoc() });
    const copy = await repo.duplicateProject(bola, meta.id);
    expect(copy.name).toBe("Orig (copy)");
    expect(copy.createdBy.email).toBe(bola.email);
    expect((await repo.toggleProjectFavorite(ada, meta.id)).favoritedBy).toEqual([ada.email]);
    expect(await repo.toggleFavorite(ada, "p05-ishango-bone")).toEqual(["p05-ishango-bone"]);
    expect(await repo.getFavorites(bola)).toEqual([]);
  });

  it("rejects malformed ids", async () => {
    await expect(repo.getProject("../../x")).rejects.toMatchObject({ status: 400 });
  });
});

describe("upload sniffing", () => {
  it("identifies files by content, not name", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(sniffMedia(png)?.contentType).toBe("image/png");
    expect(sniffMedia(Buffer.from("<svg onload=alert(1)></svg>   "))).toBeNull();
    expect(sniffMedia(Buffer.from("<html><script></script></html>"))).toBeNull();
  });
});

describe("allowlist", () => {
  const cfg = { allowedDomains: ["dawblearn.org"], allowedEmails: ["guest@gmail.com"] } as unknown as Parameters<typeof isEmailAllowed>[1];
  it("admits allowlisted domains and emails only", () => {
    expect(isEmailAllowed("Someone@DawbLearn.org", cfg)).toBe(true);
    expect(isEmailAllowed("guest@gmail.com", cfg)).toBe(true);
    expect(isEmailAllowed("stranger@gmail.com", cfg)).toBe(false);
    expect(isEmailAllowed("x@evil-dawblearn.org", cfg)).toBe(false);
  });
  it("admits nobody when no allowlist is configured", () => {
    expect(isEmailAllowed("a@dawblearn.org", { allowedDomains: [], allowedEmails: [] } as unknown as Parameters<typeof isEmailAllowed>[1])).toBe(false);
  });
});
