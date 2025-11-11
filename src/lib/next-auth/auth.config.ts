import type { NextAuthConfig } from 'next-auth';

import { ssoProviders } from './sso-providers';

const initSSOProviders = () =>
    ssoProviders.map((sso) => {
        if (!sso) throw new Error(`[NextAuth] provider ${sso} is not supported`);
        return sso.provider;
    }) ?? [];

//@ts-ignore
const mapUserToAuthData = (user: any = {}): any => ({
    id: user.id,
    userName: user.userName,
    fullName: user.fullName,
    jobTitle: user.jobTitle,
    office: user.office,
    email: user.email,
    policies: user.policies,
});

export default {
    callbacks: {
        async authorized({ auth }: any) {
            return !!auth;
        },

        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user = mapUserToAuthData(token);
                session.accessToken = token.accessToken;
                session.accessTokenExpires = token.accessTokenExpires;
            }

            if (token.error) {
                session.error = token.error;
            }

            return session;
        },
    },
    providers: initSSOProviders(),
    trustHost: true,
} satisfies NextAuthConfig;
