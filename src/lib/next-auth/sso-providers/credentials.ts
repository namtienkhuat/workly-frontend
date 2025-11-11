import Credentials from 'next-auth/providers/credentials';

const provider = {
    id: 'credentials',
    provider: Credentials({
        type: 'credentials',
        credentials: {
            userId: { type: 'text', required: true },
            email: { type: 'text', required: true },
            password: { type: 'password', required: true },
        },
        /**
         * Authorize function validates user credentials via backend API.
         * Backend sets an httpOnly cookie for authentication.
         *
         * @param credentials - User credentials including email and password
         * @returns user object if login successful
         * @throws Error if login fails
         */
        async authorize(credentials) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                }),
                credentials: 'include',
            });
            const backendData = await res.json();
            console.log('backendData', backendData);

            if (!res.ok || !backendData?.success) {
                throw new Error(backendData.message || 'Invalid credentials');
            }
            return backendData.data?.user;
        },
    }),
};

export default provider;
