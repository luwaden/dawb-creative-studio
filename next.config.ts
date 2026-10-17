import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The server-side renderer pulls in native binaries and webpack; keep them out of the Next bundle.
  serverExternalPackages: ["@remotion/renderer", "@remotion/bundler", "@remotion/compositor-linux-x64-gnu", "@remotion/compositor-win32-x64-msvc", "@remotion/compositor-darwin-arm64", "@remotion/compositor-darwin-x64", "esbuild"],
  images: { unoptimized: true },
  // On Vercel the server renderer is disabled (route returns 501 before importing it),
  // so keep its large native binaries out of the deployed function bundles.
  outputFileTracingExcludes: {
    "/api/render": ["node_modules/@remotion/compositor-*/**", "node_modules/@remotion/bundler/**", "node_modules/webpack/**", "node_modules/esbuild/**", "node_modules/@esbuild/**"],
    "/api/render/[id]": ["node_modules/@remotion/compositor-*/**", "node_modules/@remotion/bundler/**"],
    "/api/render/[id]/file": ["node_modules/@remotion/compositor-*/**", "node_modules/@remotion/bundler/**"],
  },
};

export default nextConfig;
