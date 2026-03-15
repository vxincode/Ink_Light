import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 添加你使用的图床/CDN域名，例如：
      // { hostname: 'cdn.yourdomain.com' },
      // { hostname: 'your-bucket.s3.amazonaws.com' },
    ],
  },
};

export default nextConfig;
