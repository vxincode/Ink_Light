import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 配置静态文件 headers
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      // 添加你使用的图床/CDN域名
      // { hostname: 'cdn.yourdomain.com' },
      // { hostname: 'your-bucket.s3.amazonaws.com' },
    ],
  },
};

export default nextConfig;
