/** @type {import('next').NextConfig} */
const nextConfig = {
allowedDevOrigins: [
    'http://192.168.1.158:3000', 
    '192.168.1.158:3000',
    'http://localhost:3000',
    'localhost:3000'
  ],

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
};

export default nextConfig;
