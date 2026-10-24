"use client";

import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { isLocalImage, resolveLocalImage } from "@/lib/client/localImages";

/** <img> that also shows device-only ("local:") photos. */
export function SmartImg({ src, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const [url, setUrl] = useState<string | null>(isLocalImage(src) ? null : src);
  useEffect(() => {
    if (!isLocalImage(src)) return setUrl(src);
    let alive = true;
    resolveLocalImage(src).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [src]);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} {...rest} />;
}
