import type { DesignDoc, DesignElement, DesignPage } from "./types";

/**
 * Editor state with undo/redo. Consecutive edits with the same `coalesce` key
 * (e.g. typing in one text field) merge into a single history step.
 */
export interface EditorState {
  doc: DesignDoc;
  past: DesignDoc[];
  future: DesignDoc[];
  pageIndex: number;
  selected: string[];
  lastKey: string | null;
  lastAt: number;
  dirty: boolean;
}

export type Action =
  | { type: "load"; doc: DesignDoc }
  | { type: "mutate"; fn: (doc: DesignDoc) => DesignDoc; coalesce?: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "select"; ids: string[] }
  | { type: "page"; index: number }
  | { type: "saved" };

const LIMIT = 100;

export function initState(doc: DesignDoc): EditorState {
  return { doc, past: [], future: [], pageIndex: 0, selected: [], lastKey: null, lastAt: 0, dirty: false };
}

export function reducer(s: EditorState, a: Action): EditorState {
  switch (a.type) {
    case "load":
      return initState(a.doc);
    case "mutate": {
      const next = a.fn(s.doc);
      if (next === s.doc) return s;
      const now = Date.now();
      const merge = a.coalesce && a.coalesce === s.lastKey && now - s.lastAt < 1200;
      const past = merge ? s.past : [...s.past, s.doc].slice(-LIMIT);
      const pageIndex = Math.min(s.pageIndex, next.pages.length - 1);
      const ids = new Set(next.pages[pageIndex].elements.map((e) => e.id));
      return { ...s, doc: next, past, future: [], lastKey: a.coalesce ?? null, lastAt: now, dirty: true, pageIndex, selected: s.selected.filter((id) => ids.has(id)) };
    }
    case "undo": {
      if (!s.past.length) return s;
      const prev = s.past[s.past.length - 1];
      return { ...s, doc: prev, past: s.past.slice(0, -1), future: [s.doc, ...s.future], lastKey: null, dirty: true, pageIndex: Math.min(s.pageIndex, prev.pages.length - 1), selected: [] };
    }
    case "redo": {
      if (!s.future.length) return s;
      const nxt = s.future[0];
      return { ...s, doc: nxt, past: [...s.past, s.doc], future: s.future.slice(1), lastKey: null, dirty: true, pageIndex: Math.min(s.pageIndex, nxt.pages.length - 1), selected: [] };
    }
    case "select":
      return { ...s, selected: a.ids };
    case "page":
      return { ...s, pageIndex: Math.max(0, Math.min(a.index, s.doc.pages.length - 1)), selected: [] };
    case "saved":
      return { ...s, dirty: false };
  }
}

// ---------- pure document helpers ----------
export function updatePage(doc: DesignDoc, index: number, fn: (p: DesignPage) => DesignPage): DesignDoc {
  return { ...doc, pages: doc.pages.map((p, i) => (i === index ? fn(p) : p)) };
}

export function updateElement(doc: DesignDoc, index: number, id: string, patch: Partial<DesignElement>): DesignDoc {
  return updatePage(doc, index, (p) => ({ ...p, elements: p.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as DesignElement) : e)) }));
}

export function newId(prefix = "el") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function reorder(doc: DesignDoc, index: number, id: string, where: "forward" | "backward" | "front" | "back"): DesignDoc {
  return updatePage(doc, index, (p) => {
    const els = [...p.elements];
    const i = els.findIndex((e) => e.id === id);
    if (i < 0) return p;
    const [el] = els.splice(i, 1);
    const target = where === "front" ? els.length : where === "back" ? 0 : where === "forward" ? Math.min(els.length, i + 1) : Math.max(0, i - 1);
    els.splice(target, 0, el);
    return { ...p, elements: els };
  });
}

export function duplicateElements(doc: DesignDoc, index: number, ids: string[]): { doc: DesignDoc; newIds: string[] } {
  const newIds: string[] = [];
  const next = updatePage(doc, index, (p) => {
    const els = [...p.elements];
    for (const id of ids) {
      const i = els.findIndex((e) => e.id === id);
      if (i < 0) continue;
      const copy = { ...els[i], id: newId(), x: els[i].x + 30, y: els[i].y + 30, locked: false } as DesignElement;
      els.splice(i + 1, 0, copy);
      newIds.push(copy.id);
    }
    return { ...p, elements: els };
  });
  return { doc: next, newIds };
}

export function removeElements(doc: DesignDoc, index: number, ids: string[]): DesignDoc {
  const set = new Set(ids);
  return updatePage(doc, index, (p) => ({ ...p, elements: p.elements.filter((e) => !set.has(e.id) || e.locked) }));
}

export function duplicatePage(doc: DesignDoc, index: number): DesignDoc {
  const src = doc.pages[index];
  const copy: DesignPage = { ...src, id: newId("page"), name: `${src.name ?? "Slide"} copy`, elements: src.elements.map((e) => ({ ...e, id: newId() })) };
  const pages = [...doc.pages];
  pages.splice(index + 1, 0, copy);
  return { ...doc, pages };
}

export function addBlankPage(doc: DesignDoc, index: number): DesignDoc {
  const pages = [...doc.pages];
  pages.splice(index + 1, 0, { id: newId("page"), name: "New slide", background: { color: doc.pages[index].background.color }, elements: [] });
  return { ...doc, pages };
}

export function removePage(doc: DesignDoc, index: number): DesignDoc {
  if (doc.pages.length <= 1) return doc;
  return { ...doc, pages: doc.pages.filter((_, i) => i !== index) };
}

export function movePage(doc: DesignDoc, index: number, dir: -1 | 1): DesignDoc {
  const j = index + dir;
  if (j < 0 || j >= doc.pages.length) return doc;
  const pages = [...doc.pages];
  [pages[index], pages[j]] = [pages[j], pages[index]];
  return { ...doc, pages };
}
