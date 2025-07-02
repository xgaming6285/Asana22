import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const withBundleAnalyzer = process.env.ANALYZE === 'true'
    ? require('@next/bundle-analyzer')({
        enabled: true,
    })
    : (config) => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        optimizeCss: true,
    },
};

export default withBundleAnalyzer(nextConfig);
