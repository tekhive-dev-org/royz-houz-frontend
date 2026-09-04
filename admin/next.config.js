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
};

module.exports = nextConfig;
