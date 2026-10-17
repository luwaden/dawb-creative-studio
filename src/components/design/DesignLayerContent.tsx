"use client";

import { Group, Image as KImage, Rect } from "react-konva";
import type { PageView } from "@/lib/design/types";
import { resolveColor } from "@/lib/design/types";
import { useCanvasImage } from "@/lib/design/imageCache";
import { computeCrop, ElementNode, type NodeHandlers } from "./nodes";

function BackgroundImage({ src, width, height, opacity }: { src: string; width: number; height: number; opacity: number }) {
  const { image } = useCanvasImage(src);
  if (!image) return null;
  const fit = computeCrop(image, { width, height, fit: "cover", cropZoom: 1, cropX: 0, cropY: 0 });
  return <KImage image={image} crop={fit.crop} width={width} height={height} opacity={opacity} listening={false} />;
}

/** Everything that gets exported: background + elements, in design coordinates. */
export function DesignLayerContent({ doc, h, onBackgroundClick }: { doc: PageView; h: NodeHandlers; onBackgroundClick?: () => void }) {
  return (
    <Group>
      <Rect
        name="background"
        width={doc.width}
        height={doc.height}
        fill={resolveColor(doc.background.color, doc.palette)}
        listening={h.interactive}
        onMouseDown={onBackgroundClick}
        onTap={onBackgroundClick}
      />
      {doc.background.imageSrc && (
        <BackgroundImage src={doc.background.imageSrc} width={doc.width} height={doc.height} opacity={doc.background.imageOpacity ?? 1} />
      )}
      {doc.elements.map((el) => (
        <ElementNode key={el.id} el={el} palette={doc.palette} h={h} />
      ))}
    </Group>
  );
}
