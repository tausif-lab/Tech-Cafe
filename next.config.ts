import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // firebase-admin uses Node.js-only APIs — must not be bundled for client/edge
  serverExternalPackages: ['firebase-admin'],

  async headers() {
    return [
      {
        // Serve the FCM service worker with the correct MIME type and full-origin scope
        source: '/firebase-messaging-sw.js',
        headers: [
          { key: 'Content-Type',              value: 'application/javascript' },
          { key: 'Service-Worker-Allowed',    value: '/' },
          { key: 'Cache-Control',             value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ]
  },
};

export default nextConfig;
