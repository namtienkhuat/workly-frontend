import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        apiToken?: string;
        id?: string;
    }

    interface Session {
        apiToken?: string;
        user: {
            id?: string;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        apiToken?: string;
        id?: string;
    }
}
