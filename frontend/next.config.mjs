/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.158',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: ["192.168.1.158:3000"],
  },
};

export default nextConfig;
