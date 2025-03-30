/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    }, // Use object format instead of boolean
  },
  images: {
    domains: ["images.unsplash.com", "plus.unsplash.com", "placehold.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
      {
        source: "/shop/:path*",
        destination: "/products/:path*",
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', and other Node.js built-ins on the client side
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        perf_hooks: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
