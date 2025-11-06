'use client';

import { useFormContext } from 'react-hook-form';
import { OnboardingFormData } from '@/lib/validations/onboarding';

const ProfileCard = ({ data }: { data: Partial<OnboardingFormData> }) => (
    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
        <div className="relative h-24 rounded-t-lg bg-gray-200">
            <div className="absolute -bottom-12 left-1/2 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full bg-orange-500 text-4xl font-bold text-white ring-4 ring-white">
                {data.name?.charAt(0).toUpperCase() || 'T'}
            </div>

            <div className="absolute -bottom-4 right-10 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                    className="h-6 w-6"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            </div>
        </div>
        <div className="mt-16 text-center">
            <h3 className="text-xl font-bold text-gray-900">{data.name || 'Tên của bạn'}</h3>
            <p className="text-gray-600">{data.companyPosition || 'Vị trí công việc'}</p>
        </div>
    </div>
);

const NextStepCard = ({
    step,
    title,
    description,
}: {
    step: string;
    title: string;
    description: string;
}) => (
    <div className="flex-1 rounded-lg bg-gray-100 p-6 text-left">
        <span className="text-xs font-bold text-green-600">Step {step}</span>
        <h4 className="mt-2 font-semibold text-gray-800">{title}</h4>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
);

export default function CompletionStep() {
    const { watch } = useFormContext<OnboardingFormData>();
    const formData = watch();

    return (
        <div className="flex w-full max-w-md animate-fade-in flex-col items-center text-center mx-auto">
            <ProfileCard data={formData} />
            <h1 className="mt-8 text-3xl font-bold text-gray-800">Hoàn tất hồ sơ!</h1>
            <p className="mt-2 text-gray-600">
                Bạn có thể truy cập bất cứ lúc nào để chỉnh sửa hồ sơ.
            </p>

            <div className="my-8 w-full text-left">
                <h2 className="text-center font-semibold text-gray-900">Bước tiếp theo?</h2>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                    <NextStepCard
                        step="1"
                        title="Xác minh email"
                        description="Vui lòng xác minh email để bắt đầu."
                    />
                    <NextStepCard
                        step="2"
                        title="Tuyển dụng cùng Cake"
                        description="Đăng tin tuyển dụng, tìm kiếm nhân tài và quản lý."
                    />
                </div>
            </div>

            <button className="w-full rounded-md bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700">
                Tiếp tục
            </button>
        </div>
    );
}
