import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const config = {
    matcher: ['/home/:path*', '/dashboard/:path*', '/profile', '/onboarding'],
};

const nextAuthMiddleware = auth((req) => {
    const session = req.auth;
    const nextUrl = req.nextUrl;

    if (session && nextUrl.pathname === '/signin') {
        return NextResponse.redirect(new URL('/home', nextUrl));
    }

    if (!session && nextUrl.pathname !== '/signin') {
        let callbackUrl = nextUrl.pathname;

        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        return NextResponse.redirect(new URL(`/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl));
    }

    return NextResponse.next();
});

export default nextAuthMiddleware;
