/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},  // 👈 Add this to silence the error

  serverExternalPackages: ['nodemailer'],  // updated field

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
