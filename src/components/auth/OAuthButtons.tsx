'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa6';

export const OAuthButtons = () => {
    const handleOAuthSignIn = (provider: 'google' | 'github' | 'facebook') => {
        signIn(provider, {
            callbackUrl: '/home',
        });
    };

    return (
        <div className="space-y-3">
            <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn('google')}
            >
                <FaGoogle className="mr-2 h-4 w-4" />
                Continue with Google
            </Button>
            <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn('github')}
            >
                <FaGithub className="mr-2 h-4 w-4" />
                Continue with GitHub
            </Button>
            <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn('facebook')}
            >
                <FaFacebook className="mr-2 h-4 w-4" />
                Continue with Facebook
            </Button>
        </div>
    );
};
