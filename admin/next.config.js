/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/comments",
        destination: "/blog",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/assets/:path*",
        destination: `${process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"}/assets/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
