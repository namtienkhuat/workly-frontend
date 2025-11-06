'use client';

import { useFormContext, Controller } from 'react-hook-form';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { OnboardingFormData } from '@/lib/validations/onboarding';

const optionsData = {
    workStatus: ['Đã có việc làm', 'Thất nghiệp', 'Đang học tập', 'Trong thời kỳ quân ngũ'],
    experienceLevel: [
        'Dưới 1 năm',
        '1-2 năm',
        '2-4 năm',
        '4-6 năm',
        '6-10 năm',
        '10-15 năm',
        'Hơn 15 năm',
    ],
    jobSearchStatus: ['Tắt trạng thái tìm việc', 'Bật trạng thái tìm việc', 'Sẵn sàng phỏng vấn'],
};

const QuestionBlock = ({ title, options, value, onValueChange, error }: any) => (
    <div className="mb-6">
        <h3 className="mb-3 text-md font-semibold text-gray-800">
            {title} <span className="text-red-500">*</span>
        </h3>
        <RadioGroup.Root
            value={value}
            onValueChange={onValueChange}
            className="flex flex-wrap gap-3"
        >
            {options.map((option: string) => (
                <RadioGroup.Item
                    key={option}
                    value={option}
                    id={`${title}-${option}`}
                    className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    <label htmlFor={`${title}-${option}`}>{option}</label>
                </RadioGroup.Item>
            ))}
        </RadioGroup.Root>
        {error && <p className="mt-2 text-xs text-red-600">{error.message}</p>}
    </div>
);

export default function JobStatusStep() {
    const {
        control,
        formState: { errors },
    } = useFormContext<OnboardingFormData>();

    return (
        <div className="flex flex-col">
            <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
                Thiết lập hồ sơ cá nhân
            </h1>

            <Controller
                name="workStatus"
                control={control}
                render={({ field }) => (
                    <QuestionBlock
                        title="Tình trạng việc làm hiện tại của bạn là gì?"
                        options={optionsData.workStatus}
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.workStatus}
                    />
                )}
            />

            <Controller
                name="experienceLevel"
                control={control}
                render={({ field }) => (
                    <QuestionBlock
                        title="Bạn có bao nhiêu năm kinh nghiệm?"
                        options={optionsData.experienceLevel}
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.experienceLevel}
                    />
                )}
            />

            <Controller
                name="jobSearchStatus"
                control={control}
                render={({ field }) => (
                    <QuestionBlock
                        title="Tình trạng tìm kiếm công việc của bạn?"
                        options={optionsData.jobSearchStatus}
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.jobSearchStatus}
                    />
                )}
            />
        </div>
    );
}
