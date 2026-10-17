"use client";

import { useCallback, useReducer } from "react";

interface H<T> { value: T; past: T[]; future: T[]; key: string | null; at: number; dirty: boolean }
type A<T> = { type: "set"; fn: (v: T) => T; key?: string } | { type: "undo" } | { type: "redo" } | { type: "saved" };

function reduce<T>(s: H<T>, a: A<T>): H<T> {
  switch (a.type) {
    case "set": {
      const v = a.fn(s.value);
      if (v === s.value) return s;
      const now = Date.now();
      const merge = a.key && a.key === s.key && now - s.at < 1200;
      return { value: v, past: merge ? s.past : [...s.past, s.value].slice(-100), future: [], key: a.key ?? null, at: now, dirty: true };
    }
    case "undo":
      return s.past.length ? { ...s, value: s.past[s.past.length - 1], past: s.past.slice(0, -1), future: [s.value, ...s.future], key: null, dirty: true } : s;
    case "redo":
      return s.future.length ? { ...s, value: s.future[0], past: [...s.past, s.value], future: s.future.slice(1), key: null, dirty: true } : s;
    case "saved":
      return { ...s, dirty: false };
  }
}

/** Undo/redo state; edits sharing a coalesce key within ~1s become one step. */
export function useHistory<T>(initial: T) {
  const [s, dispatch] = useReducer(reduce<T>, { value: initial, past: [], future: [], key: null, at: 0, dirty: false });
  const set = useCallback((fn: (v: T) => T, key?: string) => dispatch({ type: "set", fn, key }), []);
  return {
    value: s.value,
    dirty: s.dirty,
    canUndo: s.past.length > 0,
    canRedo: s.future.length > 0,
    set,
    undo: useCallback(() => dispatch({ type: "undo" }), []),
    redo: useCallback(() => dispatch({ type: "redo" }), []),
    markSaved: useCallback(() => dispatch({ type: "saved" }), []),
  };
}
