import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Local hosting uses next start; Docker opts into the standalone server.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  devIndicators: false,
  outputFileTracingExcludes: {
    "*": ["./data/**/*", "./deploy/**/*", "./.env*"],
  },
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
