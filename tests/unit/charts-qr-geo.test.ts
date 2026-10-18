import { describe, expect, it } from "vitest";
import { formatValue, niceScale, rampColor, waterfallSteps } from "@/lib/charts";
import { findRegion, MAPS } from "@/lib/geo/match";
import { qrMatrix, qrPath } from "@/lib/qr";
import { FONTS, fontPackage } from "@/lib/fonts";
import fs from "node:fs";

describe("chart helpers", () => {
  it("picks readable axis maxima", () => {
    expect(niceScale(87)).toEqual({ max: 100, step: 25 });
    expect(niceScale(1862).max).toBeGreaterThanOrEqual(1862);
  });
  it("builds waterfall steps with a running total", () => {
    const s = waterfallSteps([100, -30, 10], true);
    expect(s.map((x) => x.kind)).toEqual(["start", "down", "up", "total"]);
    expect(s[3]).toEqual({ from: 0, to: 80, kind: "total" });
  });
  it("formats values and ramps colours", () => {
    expect(formatValue(1862)).toBe("1,862");
    expect(formatValue(54, "%")).toBe("54%");
    expect(rampColor("#0097b2", "#ffffff", 1)).toBe("#0097b2");
  });
});

describe("maps", () => {
  it("has all 36 states + FCT and African countries", () => {
    expect(MAPS.nigeria.regions).toHaveLength(37);
    expect(MAPS.africa.regions.length).toBeGreaterThanOrEqual(50);
  });
  it("resolves common labels and aliases", () => {
    expect(findRegion("nigeria", "Lagos")?.id).toBe("LA");
    expect(findRegion("nigeria", "Abuja")?.id).toBe("FC");
    expect(findRegion("nigeria", "Nassarawa")?.name).toBe("Nasarawa");
    expect(findRegion("nigeria", "Akwa Ibom State")?.id).toBe("AK");
    expect(findRegion("africa", "Ivory Coast")?.id).toBe("CIV");
    expect(findRegion("africa", "Niger")?.id).toBe("NER");
    expect(findRegion("africa", "Atlantis")).toBeUndefined();
  });
});

describe("qr", () => {
  it("encodes a link into a square module grid", () => {
    const m = qrMatrix("https://forms.gle/example");
    expect(m).not.toBeNull();
    expect(m!.size).toBeGreaterThanOrEqual(21);
    expect(qrPath(m!)).toMatch(/^M\d/);
  });
  it("returns null for empty input", () => {
    expect(qrMatrix("  ")).toBeNull();
  });
});

describe("fonts", () => {
  it("every registered face is imported for the app and server renders", () => {
    const css = fs.readFileSync("src/app/fonts.css", "utf8");
    const remotion = fs.readFileSync("src/remotion/fonts.ts", "utf8");
    for (const f of FONTS) for (const w of f.weights) {
      const path = `@fontsource/${fontPackage(f.family)}/latin-${w}.css`;
      expect(css).toContain(path);
      expect(remotion).toContain(path);
    }
  });
});
