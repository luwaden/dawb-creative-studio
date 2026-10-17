import { createBuilder, doc, page } from "@/lib/design/build";
import type { DesignElement } from "@/lib/design/types";
import type { DesignTemplate } from "../types";
import { DESIGN_FORMATS } from "../types";
import { palette, paletteLabels, type B, type Theme } from "./common";

export interface PageSpec {
  name: string;
  /** Background colour or palette token; defaults to "$paper". */
  bg?: string;
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
      return doc(f.width, f.height, { palette: palette(theme), paletteLabels }, specs.map((p) => page(p.bg ?? "$paper", p.els, { name: p.name })));
    },
  };
}
