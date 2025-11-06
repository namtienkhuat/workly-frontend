'use client';

import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/validations/onboarding';
import type { FieldError } from 'react-hook-form';

const ProfilePreviewCard = ({ data }: { data: Partial<OnboardingFormData> }) => (
    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
        <div className="relative h-24 rounded-t-lg bg-gray-200">
            <div className="absolute -bottom-12 left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full bg-orange-500 text-4xl font-bold text-white ring-4 ring-white">
                {data.name?.charAt(0).toUpperCase() || 'C'}
            </div>
        </div>
        <div className="mt-16 text-center">
            <h3 className="text-xl font-bold text-gray-900">{data.name || 'Tên công ty'}</h3>
            <p className="text-gray-600">{data.companyPosition || 'Vị trí của bạn'}</p>
            <p className="mt-1 text-sm text-gray-400">Chưa có phần giới thiệu.</p>
        </div>
    </div>
);

type InputFieldProps = {
    label: string;
    name: keyof OnboardingFormData;
    register: any;
    error?: FieldError;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputField = ({ label, name, register, error, ...props }: InputFieldProps) => (
    <div className="mb-4 grid">
        {' '}
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
            {' '}
            {label} <span className="text-red-500">*</span>
        </label>
        <input
            id={name}
            className={`mt-1 w-full rounded-md border bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
            }`}
            {...register(name)}
            {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </div>
);

export default function CreateProfileStep() {
    const {
        register,
        watch,
        formState: { errors },
    } = useFormContext<OnboardingFormData>();

    const watchedData = watch();

    return (
        <div className="w-full max-w-5xl animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800">Create Profile</h1>
            <p className="mt-2 text-gray-500">
                Creating a well-established company profile can strengthen your employer brand.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
                {/* <div className="rounded-lg bg-white p-8 shadow-md"> */}
                <div>
                    <div>
                        {' '}
                        <InputField
                            label="Tên"
                            name="name"
                            register={register}
                            error={errors.name}
                        />
                        <InputField
                            label="Điện thoại"
                            name="phone"
                            type="tel"
                            register={register}
                            error={errors.phone}
                        />
                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            register={register}
                            error={errors.email}
                        />
                        <InputField
                            label="Nghề nghiệp của bạn là gì?"
                            name="profession"
                            register={register}
                            error={errors.profession}
                        />
                        <InputField
                            label="Vị trí"
                            name="companyPosition"
                            register={register}
                            error={errors.companyPosition}
                        />
                        <InputField
                            label="Địa điểm"
                            name="location"
                            register={register}
                            error={errors.location}
                        />
                    </div>
                </div>

                <div className="flex items-start justify-center">
                    <ProfilePreviewCard data={watchedData} />
                </div>
            </div>
        </div>
    );
}
