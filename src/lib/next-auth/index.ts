import NextAuth from 'next-auth';

import config from './auth.config';

const MAX_AGE_DAYS = 7;
const SECONDS_IN_A_DAY = 24 * 60 * 60;
const MAX_AGE = MAX_AGE_DAYS * SECONDS_IN_A_DAY;

export default NextAuth({
    ...config,
    session: {
        strategy: 'jwt',
        maxAge: MAX_AGE,
    },
    jwt: {
        maxAge: MAX_AGE,
    },
});
