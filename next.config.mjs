/** @type {import('next').NextConfig} */
const nextConfig = {
    optimizeFonts: false,
    experimental: {
        serverComponentsExternalPackages: ['pdf-parse', 'prisma', '@prisma/client'],
    },
    eslint: {
        // Prevent ESLint warnings from failing the Vercel build
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Ensure TS errors still fail the build for safety
        ignoreBuildErrors: false,
    },
};

export default nextConfig;
