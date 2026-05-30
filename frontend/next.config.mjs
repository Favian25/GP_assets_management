import os from 'os';

// Fungsi untuk mendapatkan semua IP lokal secara dinamis
const getLocalIps = () => {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips.length > 0 ? ips : ['localhost'];
};

const localIps = getLocalIps();

// Support production URL from NEXT_PUBLIC_API_URL
let apiHost = '';
let apiProtocol = '';
let apiPort = '';

if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL);
    apiHost = url.hostname;
    apiProtocol = url.protocol.replace(':', '');
    apiPort = url.port;
  } catch (e) {
    console.error("Invalid NEXT_PUBLIC_API_URL:", e);
  }
}

const remotePatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '5000',
    pathname: '/**',
  },
  ...localIps.map(ip => ({
    protocol: 'http',
    hostname: ip,
    port: '5000',
    pathname: '/**',
  })),
];

if (apiHost) {
  remotePatterns.push({
    protocol: apiProtocol || 'https',
    hostname: apiHost,
    port: apiPort || '',
    pathname: '/**',
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
  allowedDevOrigins: [...localIps, 'localhost'],
};

export default nextConfig;
