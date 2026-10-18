/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local images are served from /public; allow remote images if the admin
    // configures external URLs for logos / gallery in settings.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-lib", "pg"],
  },
};

module.exports = nextConfig;
