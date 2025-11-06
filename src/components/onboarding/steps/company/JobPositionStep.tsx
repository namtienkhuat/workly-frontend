'use client';

import { useFormContext, Controller } from 'react-hook-form';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { OnboardingFormData } from '@/lib/validations/onboarding';

const POSITIONS = [
    'Founder',
    'C-Level / VP / Manager',
    'Hiring Manager / Team Leader',
    'Team Member',
    'Recruiter',
    'Freelancer',
];

export default function JobPositionStep() {
    const {
        control,
        formState: { errors },
    } = useFormContext<OnboardingFormData>();

    return (
        <div className="w-full max-w-lg animate-fade-in rounded-lg bg-white p-8 text-center shadow-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Vị trí công việc hiện tại</h1>
            <p className="mt-2 text-gray-600">Giúp Cake cá nhân hóa trải nghiệm của bạn.</p>

            <Controller
                name="jobPosition"
                control={control}
                render={({ field }) => (
                    <RadioGroup.Root
                        value={field.value}
                        onValueChange={field.onChange}
                        className="mt-8 flex flex-col gap-3"
                    >
                        {POSITIONS.map((pos) => (
                            <RadioGroup.Item
                                key={pos}
                                value={pos}
                                className="w-full cursor-pointer rounded-md border border-gray-300 bg-white p-4 text-center font-medium text-gray-700 transition-colors data-[state=checked]:border-green-500 data-[state=checked]:bg-green-50 data-[state=checked]:text-green-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {pos}
                            </RadioGroup.Item>
                        ))}
                    </RadioGroup.Root>
                )}
            />

            {errors.jobPosition && (
                <p className="mt-2 text-xs text-red-600">{errors.jobPosition.message}</p>
            )}
        </div>
    );
}
