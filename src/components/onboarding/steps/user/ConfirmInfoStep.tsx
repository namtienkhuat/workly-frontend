'use client';

import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/validations/onboarding';

export default function ConfirmInfoStep() {
    const {
        register,
        formState: { errors },
    } = useFormContext<OnboardingFormData>();

    return (
        <div className="flex flex-col">
            {/* Header */}
            <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
                Xác nhận thông tin
            </h1>
            <p className="mb-8 text-center text-gray-500">
                Hãy chắc chắn rằng thông tin của bạn là chính xác.
            </p>

            <div className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Tên <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <input
                            id="name"
                            type="text"
                            {...register('name')}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                                errors.name
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-green-400'
                            }`}
                            placeholder="Nguyễn Văn A"
                        />
                    </div>
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                                errors.email
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-green-400'
                            }`}
                            placeholder="example@email.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Tên tài khoản <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                        <input
                            id="username"
                            type="text"
                            {...register('username')}
                            className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                                errors.username
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-green-400'
                            }`}
                            placeholder="nguyenvana"
                        />
                    </div>
                    {errors.username && (
                        <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
