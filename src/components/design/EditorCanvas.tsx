"use client";

import Konva from "konva";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Line, Stage, Transformer } from "react-konva";
import type { DesignElement, PageView, TextElement } from "@/lib/design/types";
import { resolveColor } from "@/lib/design/types";
import { nearestWeight } from "@/lib/fonts";
import { DesignLayerContent } from "./DesignLayerContent";

interface Props {
  view: PageView;
  scale: number;
  selected: string[];
  onSelect: (ids: string[]) => void;
  onChange: (changes: Array<{ id: string; patch: Partial<DesignElement> }>) => void;
}

const SNAP = 8;

export function EditorCanvas({ view, scale, selected, onSelect, onChange }: Props) {
  const nodes = useRef(new Map<string, Konva.Node>());
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const dragStart = useRef<Map<string, { x: number; y: number }> | null>(null);
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const [editing, setEditing] = useState<TextElement | null>(null);
  const elById = useMemo(() => new Map(view.elements.map((e) => [e.id, e])), [view.elements]);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const list = selected.map((id) => nodes.current.get(id)).filter((n): n is Konva.Node => Boolean(n) && !elById.get(n!.id())?.locked);
    tr.nodes(list);
    const only = selected.length === 1 ? elById.get(selected[0]) : undefined;
    tr.enabledAnchors(only?.type === "text" ? ["middle-left", "middle-right", "top-left", "top-right", "bottom-left", "bottom-right"] : ["top-left", "top-center", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-center", "bottom-right"]);
    tr.keepRatio(only?.type === "text" || (only?.type === "image" && only.role === "logo"));
    tr.getLayer()?.batchDraw();
  }, [selected, elById, view]);

  const snapTargets = () => {
    const v = [0, view.width / 2, view.width];
    const h = [0, view.height / 2, view.height];
    for (const el of view.elements) {
      if (selected.includes(el.id) || el.hidden) continue;
      const n = nodes.current.get(el.id);
      if (!n) continue;
      const r = n.getClientRect({ relativeTo: n.getLayer() as unknown as Konva.Container });
      v.push(r.x, r.x + r.width / 2, r.x + r.width);
      h.push(r.y, r.y + r.height / 2, r.y + r.height);
    }
    return { v, h };
  };

  const handlers = {
    interactive: true,
    editingTextId: editing?.id ?? null,
    registerNode: (id: string, node: Konva.Node | null) => {
      if (node) nodes.current.set(id, node);
      else nodes.current.delete(id);
    },
    onSelect: (id: string, additive: boolean) => {
      if (additive) onSelect(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
      else if (!selected.includes(id)) onSelect([id]);
    },
    onDragMove: (id: string, node: Konva.Node) => {
      if (!dragStart.current) {
        dragStart.current = new Map();
        for (const sid of selected.includes(id) ? selected : [id]) {
          const el = elById.get(sid);
          if (el) dragStart.current.set(sid, { x: el.x, y: el.y });
        }
      }
      // Snap the dragged node's box edges/centre to page and sibling guides.
      const layer = node.getLayer() as unknown as Konva.Container;
      const r = node.getClientRect({ relativeTo: layer });
      const t = snapTargets();
      const tol = SNAP / scale;
      let dx = 0;
      let dy = 0;
      const gv: number[] = [];
      const gh: number[] = [];
      for (const edge of [r.x, r.x + r.width / 2, r.x + r.width]) {
        const hit = t.v.find((g) => Math.abs(g - edge) < tol);
        if (hit !== undefined && !gv.length) { dx = hit - edge; gv.push(hit); }
      }
      for (const edge of [r.y, r.y + r.height / 2, r.y + r.height]) {
        const hit = t.h.find((g) => Math.abs(g - edge) < tol);
        if (hit !== undefined && !gh.length) { dy = hit - edge; gh.push(hit); }
      }
      node.position({ x: node.x() + dx, y: node.y() + dy });
      setGuides({ v: gv, h: gh });
      const start = dragStart.current.get(id);
      if (start) {
        const offX = node.x() - start.x;
        const offY = node.y() - start.y;
        for (const [sid, pos] of dragStart.current) {
          if (sid === id) continue;
          nodes.current.get(sid)?.position({ x: pos.x + offX, y: pos.y + offY });
        }
      }
    },
    onDragEnd: (id: string, node: Konva.Node) => {
      const changes: Array<{ id: string; patch: Partial<DesignElement> }> = [{ id, patch: { x: Math.round(node.x()), y: Math.round(node.y()) } }];
      if (dragStart.current) {
        for (const sid of dragStart.current.keys()) {
          if (sid === id) continue;
          const n = nodes.current.get(sid);
          if (n) changes.push({ id: sid, patch: { x: Math.round(n.x()), y: Math.round(n.y()) } });
        }
      }
      dragStart.current = null;
      setGuides({ v: [], h: [] });
      onChange(changes);
    },
    onTransformEnd: (id: string, node: Konva.Node) => {
      const el = elById.get(id);
      if (!el) return;
      const sx = node.scaleX();
      const sy = node.scaleY();
      node.scale({ x: 1, y: 1 });
      const patch: Partial<DesignElement> = { x: Math.round(node.x()), y: Math.round(node.y()), rotation: Math.round(node.rotation() * 10) / 10 };
      if (el.type === "text") {
        const anchor = trRef.current?.getActiveAnchor() ?? "";
        const corner = /top-|bottom-/.test(anchor);
        Object.assign(patch, { width: Math.max(20, Math.round(el.width * sx)) });
        if (corner) Object.assign(patch, { fontSize: Math.max(6, Math.round(el.fontSize * sy * 10) / 10), letterSpacing: el.letterSpacing * sy });
      } else {
        Object.assign(patch, { width: Math.max(4, Math.round(el.width * sx)), height: Math.max(2, Math.round(el.height * sy)) });
      }
      onChange([{ id, patch }]);
    },
    onDblClick: (id: string) => {
      const el = elById.get(id);
      if (el?.type === "text" && !el.locked) {
        onSelect([id]);
        setEditing(el);
      }
    },
  };

  // Inline text editor overlay
  const editingNode = editing ? nodes.current.get(editing.id) : undefined;
  const commitEdit = (value: string) => {
    if (editing && value !== editing.text) onChange([{ id: editing.id, patch: { text: value } }]);
    setEditing(null);
  };

  return (
    <div className="relative" style={{ width: view.width * scale, height: view.height * scale }}>
      <Stage
        ref={stageRef}
        width={view.width * scale}
        height={view.height * scale}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelect([]);
        }}
        className="shadow-soft"
      >
        <Layer>
          <DesignLayerContent doc={view} h={handlers} onBackgroundClick={() => onSelect([])} />
        </Layer>
        <Layer>
          {guides.v.map((x) => <Line key={`v${x}`} points={[x, 0, x, view.height]} stroke="#e5397b" strokeWidth={1 / scale} listening={false} />)}
          {guides.h.map((y) => <Line key={`h${y}`} points={[0, y, view.width, y]} stroke="#e5397b" strokeWidth={1 / scale} listening={false} />)}
          <Transformer
            ref={trRef}
            rotateEnabled
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            borderStroke="#0097b2"
            anchorStroke="#0097b2"
            anchorFill="#ffffff"
            anchorSize={9}
            anchorCornerRadius={2}
            borderStrokeWidth={1.5}
            ignoreStroke
            boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 8 || Math.abs(newBox.height) < 4 ? oldBox : newBox)}
          />
        </Layer>
      </Stage>
      {editing && editingNode && (
        <textarea
          autoFocus
          defaultValue={editing.text}
          onBlur={(e) => commitEdit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(null);
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitEdit((e.target as HTMLTextAreaElement).value);
            e.stopPropagation();
          }}
          aria-label="Edit text"
          style={{
            position: "absolute",
            left: editing.x * scale,
            top: editing.y * scale,
            width: editing.width * scale,
            minHeight: editingNode.height() * scale + 8,
            transform: `rotate(${editing.rotation}deg)`,
            transformOrigin: "top left",
            fontFamily: `"${editing.fontFamily}"`,
            fontSize: editing.fontSize * scale,
            fontWeight: nearestWeight(editing.fontFamily, editing.fontWeight),
            fontStyle: editing.italic ? "italic" : "normal",
            lineHeight: editing.lineHeight,
            letterSpacing: editing.letterSpacing * scale,
            textAlign: editing.align,
            color: resolveColor(editing.fill, view.palette),
            textTransform: editing.uppercase ? "uppercase" : "none",
            background: "rgba(255,255,255,0.06)",
            outline: "2px solid #0097b2",
            border: "none",
            padding: 0,
            margin: 0,
            resize: "none",
            overflow: "hidden",
          }}
        />
      )}
    </div>
  );
}
