/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['avatars.githubusercontent.com'],
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '8000', // 👈 thêm cổng nếu bạn đang chạy API ở cổng 8000
            pathname: '/api/v1posts/images/**', // 👈 đường dẫn ảnh của bạn
          },
    ],
    },
};

export default nextConfig;
