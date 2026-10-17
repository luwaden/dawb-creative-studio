import { scene, video } from "@/lib/video/build";

/** Default props for Remotion Studio and the render smoke test. */
export const SAMPLE_VIDEO_DOC = video(
  [
    scene("kinetic-title", { eyebrow: "DAWB Learn", headline: "Data skills\nfor the real world", highlight: "real world", subline: "Sample content — edit me" }, { id: "sample-1", duration: 75, background: { color: "#000000", texture: "grid" } }),
    scene("stat-counter", { title: "By the numbers", stats: [{ value: 120, suffix: "+", label: "Sample metric" }] }, { id: "sample-2", duration: 75, transition: { type: "slide" } }),
    scene("logo-outro", {}, { id: "sample-3", duration: 60, background: { color: "#000000" } }),
  ],
  { aspect: "portrait" },
);
