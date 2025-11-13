/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['avatars.githubusercontent.com', 'es.cloudinary.com', 'res.cloudinary.com'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/api/v1posts/images/**',
            },
        ],
    },
};

export default nextConfig;
