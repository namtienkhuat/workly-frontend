'use client';

import { useFormContext, Controller } from 'react-hook-form';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { OnboardingFormData } from '@/lib/validations/onboarding';

export default function ExperienceStep() {
    const {
        register,
        control,
        watch,
        formState: { errors },
    } = useFormContext<OnboardingFormData>();

    const hasNoExperience = watch('hasNoExperience');

    return (
        <div className="w-full max-w-2xl animate-fade-in rounded-lg bg-white p-8 text-gray-800 shadow-md">
            <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
                Công việc trước đây của bạn là gì?
            </h1>
            <p className="mb-8 text-center text-gray-500">Chia sẻ kinh nghiệm làm việc đã có.</p>

            <div className="grid">
                {' '}
                <div className="mb-4 grid">
                    {' '}
                    <label className="text-sm font-medium text-gray-700">
                        {' '}
                        Công ty <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`mt-1 w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                            errors.previousCompany
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-green-500'
                        } disabled:cursor-not-allowed disabled:bg-gray-100`}
                        type="text"
                        {...register('previousCompany')}
                        disabled={hasNoExperience}
                    />
                    {errors.previousCompany && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.previousCompany.message}
                        </p>
                    )}
                </div>
                <Controller
                    name="hasNoExperience"
                    control={control}
                    render={({ field }) => (
                        <div className="mt-6 flex items-center">
                            <Checkbox.Root
                                className="flex h-5 w-5 appearance-none items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm outline-none data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600"
                                id="no-experience"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            >
                                <Checkbox.Indicator className="text-white">
                                    <CheckIcon />
                                </Checkbox.Indicator>
                            </Checkbox.Root>
                            <label className="pl-3 text-sm text-gray-700" htmlFor="no-experience">
                                Tôi không có bất kỳ kinh nghiệm làm việc nào
                            </label>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
