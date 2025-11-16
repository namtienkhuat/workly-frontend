'use client';

import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { paths } from '@/configs/route';

interface HealthResponse {
    status: string;
    message?: string;
}

const Page = () => {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const checkHealth = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get<HealthResponse>('/me');
            setHealth(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect to backend');
            setHealth(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">Workly</h1>
                    <p className="mt-2 text-gray-600">Backend Health Check</p>
                </div>

                <div className="rounded-lg border bg-white p-6 shadow-lg">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            {loading ? (
                                <span className="text-sm text-gray-500">Checking...</span>
                            ) : health ? (
                                <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                    <span className="h-2 w-2 rounded-full bg-green-600"></span>
                                    {health.status || 'Healthy'}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 text-sm font-semibold text-red-600">
                                    <span className="h-2 w-2 rounded-full bg-red-600"></span>
                                    Unhealthy
                                </span>
                            )}
                        </div>

                        {health?.message && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Message:</span>
                                <span className="text-sm text-gray-600">{health.message}</span>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                {error}
                            </div>
                        )}

                        <Button onClick={checkHealth} disabled={loading} className="w-full">
                            {loading ? 'Checking...' : 'Check Health'}
                        </Button>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href={paths.signup}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Go to Signup →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Page;
