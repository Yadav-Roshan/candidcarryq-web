/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
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
      // Add common misspellings or old URLs
      {
        source: "/product/:id",
        destination: "/products/:id",
        permanent: true,
      },
      {
        source: "/category/:category",
        destination: "/categories/:category",
        permanent: true,
      },
    ];
  },
  // Add more redirects for common misspellings
  webpack: (config, { isServer }) => {
    if (!isServer) {
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
  poweredByHeader: false, // Remove X-Powered-By header for security
};

module.exports = nextConfig;
