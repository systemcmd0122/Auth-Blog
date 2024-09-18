/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yqgzdjhafrorvvngavrc.supabase.co",
      },
    ],
  },
}

export default nextConfig
