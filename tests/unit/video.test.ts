import { describe, expect, it } from "vitest";
import { scene, video } from "@/lib/video/build";
import { getSceneStarts, getVideoDuration } from "@/lib/video/types";

describe("video timeline", () => {
  it("subtracts transition overlaps from the total duration", () => {
    const doc = video([
      scene("kinetic-title", {}, { duration: 90, transition: { type: "fade", durationInFrames: 15 } }),
      scene("quote", {}, { duration: 60, transition: { type: "none", durationInFrames: 15 } }),
      scene("logo-outro", {}, { duration: 30 }),
    ]);
    expect(getVideoDuration(doc)).toBe(90 + 60 + 30 - 15);
    expect(getSceneStarts(doc)).toEqual([0, 75, 135]);
  });

  it("clamps transitions longer than a neighbouring scene", () => {
    const doc = video([
      scene("kinetic-title", {}, { duration: 20, transition: { type: "fade", durationInFrames: 60 } }),
      scene("logo-outro", {}, { duration: 90 }),
    ]);
    expect(getVideoDuration(doc)).toBe(20 + 90 - 19);
  });
});
