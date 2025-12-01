/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.alias.canvas = false;
            config.resolve.alias.encoding = false;
        }
        return config;
    },
    images: {
        domains: [
            'avatars.githubusercontent.com',
            'es.cloudinary.com',
            'res.cloudinary.com',
            'randomuser.me',
        ],
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
