import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BACKEND_API_URL) {
    throw new Error('Missing environment variable');
}

export const { handlers, auth } = NextAuth({
    session: {
        strategy: 'jwt',
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        // GitHub({
        //     clientId: process.env.GITHUB_CLIENT_ID!,
        //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        // }),
        // Facebook({
        //     clientId: process.env.FACEBOOK_CLIENT_ID!,
        //     clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        // }),
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { type: 'text' },
                password: { type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) return null;
                try {
                    const res = await fetch(`${BACKEND_API_URL}/auth/signin`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                    });

                    const responseData = await res.json();

                    if (!res.ok || !responseData.success) {
                        throw new Error(responseData.message || 'Invalid email or password');
                    }
                    return {
                        ...responseData.data.user,
                        token: responseData.data.token,
                    };
                } catch (e: any) {
                    throw new Error(e.message);
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider == 'google') {
                try {
                    const res = await fetch(`${BACKEND_API_URL}/auth/oauth`, {
                        method: 'POST',
                        body: JSON.stringify({
                            email: profile?.email,
                            name: profile?.name,
                            image: (profile as any)?.picture,
                        }),
                        headers: { 'Content-Type': 'application/json' },
                    });
                    const responseData = await res.json();
                    if (!res.ok || !responseData.success)
                        throw new Error('OAuth authentication failed');
                    const { user: backendUser, token } = responseData.data;
                    user.apiToken = token;
                    user.id = backendUser.id;
                } catch (e) {
                    console.error('Error calling /auth/oauth:', e);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            console.log('user', user);

            if (user) {
                // @ts-ignore
                token.apiToken = user.token;
                token.id = user.id;
                token.user = user;
            }
            return token;
        },
        async session({ session, token }) {
            console.log('token', token);
            // @ts-ignore
            session.apiToken = token.apiToken;
            // @ts-ignore
            session.user.id = token.user.userId;
            // @ts-ignore
            session.userId = token.user.userId;
            return session;
        },
    },
});
