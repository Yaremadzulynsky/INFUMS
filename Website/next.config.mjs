/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'standalone',
    env: {
        NEXT_PUBLIC_FIREBASE_CONFIG: process.env.NEXT_PUBLIC_FIREBASE_CONFIG,
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    }
};

export default nextConfig;
