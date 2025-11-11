'use client';

import { useFormContext, Controller } from 'react-hook-form';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { OnboardingFormData } from '@/lib/validations/onboarding';

const optionsData = {
    workStatus: ['Employed', 'Unemployed', 'Student', 'On military service'],
    experienceLevel: [
        'Less than 1 year',
        '1-2 years',
        '2-4 years',
        '4-6 years',
        '6-10 years',
        '10-15 years',
        'More than 15 years',
    ],
    jobSearchStatus: ['Not looking for a job', 'Actively looking', 'Open to offers'],
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
                    {/* The label now correctly wraps the option text for accessibility */}
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
                Set up your profile
            </h1>

            <Controller
                name="workStatus"
                control={control}
                render={({ field }) => (
                    <QuestionBlock
                        title="What is your current employment status?"
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
                        title="How many years of experience do you have?"
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
                        title="What is your job search status?"
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
