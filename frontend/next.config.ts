import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  assetPrefix: "/wanderers",
  images : {
    unoptimized: true,
  },
};

export default nextConfig;
