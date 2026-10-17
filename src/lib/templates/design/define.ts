import { createBuilder, doc, page } from "@/lib/design/build";
import type { DesignElement } from "@/lib/design/types";
import type { DesignTemplate } from "../types";
import { DESIGN_FORMATS } from "../types";
import { palette, paletteLabels, type B, type Theme } from "./common";
import { backdrop, LOGO_FOR, toneOf, type Tone } from "./backdrop";
import { resolveColor } from "@/lib/design/types";

export interface PageSpec {
  name: string;
  /** Background colour or palette token; defaults to "$paper". */
  bg?: string;
  /** Skip the signature backdrop (full-bleed photo pages get a quiet one). */
  backdrop?: "full" | "quiet" | "none";
  els: DesignElement[];
}

type Meta = Omit<DesignTemplate, "kind" | "build"> & {
  theme: Theme;
  pages: (b: B, t: Theme) => PageSpec[];
};

export function defineDesign(meta: Meta): DesignTemplate {
  const { theme, pages, ...rest } = meta;
  const f = DESIGN_FORMATS[meta.format];
  return {
    ...rest,
    kind: "design",
    build: () => {
      const b = createBuilder(`${meta.id.slice(0, 12)}-`);
      const specs = pages(b, theme);
      const pal = palette(theme);
      return doc(
        f.width,
        f.height,
        { palette: pal, paletteLabels },
        specs.map((p, i) => {
          // Normalise every page onto a brand tone.
          let bg = p.bg ?? "$paper";
          let pageTone: Tone = toneOf(resolveColor(bg, pal));
          if (theme.tone === "white" && pageTone === "dark" && !bg.startsWith("$")) bg = "#000000";
          else if (!bg.startsWith("$")) {
            bg = "$paper";
            pageTone = theme.tone;
          }
          if (bg === "$paper") pageTone = theme.tone;
          const hasFullPhoto = p.els.some((e) => e.type === "image" && e.role !== "logo" && e.width >= f.width * 0.95 && e.height >= f.height * 0.6);
          const mode = p.backdrop ?? (hasFullPhoto ? "quiet" : "full");
          const back = mode === "none" ? [] : backdrop(b, pageTone, { W: f.width, H: f.height, variant: i, quiet: mode === "quiet" });
          // Photo pages: texture sits above the photo too, below the copy.
          const els = p.els.map((e) => (e.type === "image" && e.role === "logo" ? { ...e, src: `/brand/dawb-logo-${LOGO_FOR[pageTone]}.svg`, cornerRadius: 0 } : e));
          if (hasFullPhoto) {
            const photoIdx = els.findIndex((e) => e.type === "image" && e.role !== "logo");
            return page(bg, [...els.slice(0, photoIdx + 1), ...back.filter((e) => e.type === "pattern"), ...els.slice(photoIdx + 1)], { name: p.name });
          }
          return page(bg, [...back, ...els], { name: p.name });
        }),
      );
    },
  };
}
