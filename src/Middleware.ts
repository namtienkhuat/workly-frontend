import { auth } from '@/auth';

export default auth;

export const config = {
    matcher: ['/home/:path*', '/dashboard/:path*', '/profile', '/settings', '/onboarding'],
};
