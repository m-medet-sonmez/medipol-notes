import type { NextConfig } from "next";
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Lokalde service worker devre dışı (build sorununu önler)
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
