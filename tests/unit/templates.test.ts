import { describe, expect, it } from "vitest";
import { ALL_TEMPLATES, DESIGN_TEMPLATES, VIDEO_TEMPLATES } from "@/lib/templates";
import { designDocSchema } from "@/lib/design/schema";
import { videoDocSchema } from "@/lib/video/schema";
import { SCENE_DEFINITIONS } from "@/lib/video/scenes";
import { DESIGN_FORMATS } from "@/lib/templates/types";

describe("template registry", () => {
  it("has at least 30 templates with unique ids", () => {
    expect(ALL_TEMPLATES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(ALL_TEMPLATES.map((t) => t.id)).size).toBe(ALL_TEMPLATES.length);
  });

  it.each(DESIGN_TEMPLATES.map((t) => [t.id, t] as const))("design %s builds a valid, editable document", (_id, t) => {
    if (t.kind !== "design") throw new Error("wrong kind");
    const doc = t.build();
    expect(designDocSchema.safeParse(doc).success).toBe(true);
    expect(doc.width).toBe(DESIGN_FORMATS[t.format].width);
    for (const page of doc.pages) {
      const ids = page.elements.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    const labelled = doc.pages.flatMap((p) => p.elements.filter((e) => e.label));
    expect(labelled.length).toBeGreaterThan(0);
    // Every palette reference resolves.
    const json = JSON.stringify(doc.pages);
    for (const m of json.matchAll(/"\$([a-z]+)"/g)) expect(doc.palette[m[1]]).toBeDefined();
    // Builds are deterministic so saved projects stay stable.
    expect(JSON.stringify(t.build())).toBe(JSON.stringify(doc));
  });

  it.each(VIDEO_TEMPLATES.map((t) => [t.id, t] as const))("video %s builds a valid document", (_id, t) => {
    if (t.kind !== "video") throw new Error("wrong kind");
    const doc = t.build();
    const parsed = videoDocSchema.safeParse(doc);
    expect(parsed.success, JSON.stringify(parsed.error?.issues[0])).toBe(true);
    expect(doc.aspect).toBe(t.aspect);
    for (const s of doc.scenes) {
      const allowed = new Set(SCENE_DEFINITIONS[s.type].fields.map((f) => f.key));
      for (const k of Object.keys(s.props)) expect(allowed.has(k), `${s.type}.${k}`).toBe(true);
    }
  });

  it("uses only the campaign handles", () => {
    const text = JSON.stringify(ALL_TEMPLATES.map((t) => t.build()));
    expect(text).not.toContain("@dawblearn");
    expect(text).toContain("@dawb_learn");
    expect(text).toContain("www.dawblearn.org");
  });
});
