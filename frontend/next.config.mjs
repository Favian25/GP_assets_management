import os from 'os';

// Fungsi untuk mendapatkan IP lokal secara dinamis
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const localIp = getLocalIp();

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    localIp,
    'localhost'
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
        hostname: localIp,
        port: '5000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
