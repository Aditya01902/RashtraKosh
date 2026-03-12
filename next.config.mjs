/** @type {import('next').NextConfig} */
const nextConfig = {
    optimizeFonts: false,
    outputFileTracing: process.env.VERCEL === '1',
    experimental: {
        serverComponentsExternalPackages: ['pdf-parse', '@heyputer/puter.js', 'prisma', '@prisma/client']
    }
};

export default nextConfig;
