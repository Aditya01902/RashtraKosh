/** @type {import('next').NextConfig} */
const nextConfig = {
    optimizeFonts: false,
    outputFileTracing: false,
    experimental: {
        serverComponentsExternalPackages: ['pdf-parse', '@heyputer/puter.js', 'prisma', '@prisma/client']
    }
};

export default nextConfig;
