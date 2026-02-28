/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false, // Production'da da aktif
    buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig = {
    turbopack: {},
};

module.exports = withPWA(nextConfig);
