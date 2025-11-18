'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { USER_ONBOARDING_FLOW, COMPANY_ONBOARDING_FLOW } from '@/lib/onboarding-config';
import { OnboardingFormData, onboardingSchema } from '@/lib/validations/onboarding';

import ConfirmInfoStep from './steps/user/ConfirmInfoStep';
import JobStatusStep from './steps/user/JobStatusStep';
import ExperienceStep from './steps/user/ExperienceStep';
import CreateProfileStep from './steps/company/CreateProfileStep';
import JobPositionStep from './steps/company/JobPositionStep';
import CompletionStep from './steps/company/CompletionStep';

import ProgressBar from './ProgressBar';
import NavigationButtons from './NavigationButtons';

const stepComponents: Record<string, React.ComponentType<any>> = {
    'confirm-info': ConfirmInfoStep,
    'job-status': JobStatusStep,
    experience: ExperienceStep,
    'create-profile': CreateProfileStep,
    'job-position': JobPositionStep,
    completion: CompletionStep,
};

const stepFieldMap: Record<string, (keyof OnboardingFormData)[]> = {
    'confirm-info': ['name', 'email', 'username'],
    'job-status': ['workStatus', 'jobSearchStatus'],
    experience: ['experienceLevel'],
    'create-profile': ['name', 'phone', 'email', 'profession', 'companyPosition', 'location'],
    'job-position': ['jobPosition'],
    completion: [],
};

export default function OnboardingController() {
    const router = useRouter();
    const params = useParams();

    const roleParam = params.role as 'user' | 'company';
    const currentStepSlug = params.step as keyof typeof stepComponents;

    const flow = roleParam === 'user' ? USER_ONBOARDING_FLOW : COMPANY_ONBOARDING_FLOW;
    const currentStepIndex = flow.indexOf(currentStepSlug);

    const methods = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        mode: 'onChange',
        defaultValues: {
            role: roleParam,
            name: '',
            email: '',
            username: '',
            workStatus: '',
            experienceLevel: '',
            jobSearchStatus: '',
            phone: '',
            profession: '',
            companyPosition: '',
            location: '',
            jobPosition: '',
        },
    });

    const { trigger, handleSubmit } = methods;

    const CurrentStepComponent = stepComponents[currentStepSlug];
    if (!CurrentStepComponent) {
        return <div>Bước không hợp lệ.</div>;
    }

    const goToNextStep = async () => {
        const fieldsToValidate = stepFieldMap[currentStepSlug] || [];

        const isStepValid = await trigger(fieldsToValidate);

        if (!isStepValid) return;

        if (currentStepIndex < flow.length - 1) {
            const nextStepSlug = flow[currentStepIndex + 1];
            router.push(`/${roleParam}/${nextStepSlug}`);
        } else {
            handleSubmit(onSubmit)();
        }
    };

    const goToPreviousStep = () => {
        if (currentStepIndex > 0) {
            const prevStepSlug = flow[currentStepIndex - 1];
            router.push(`/${roleParam}/${prevStepSlug}`);
        } else {
            router.push('/select-role');
        }
    };

    const onSubmit = (data: OnboardingFormData) => {
        alert('🎉 Onboarding hoàn tất! Kiểm tra console để xem dữ liệu.');
    };

    const isLastCompanyStep = roleParam === 'company' && currentStepSlug === 'completion';

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex w-full max-w-2xl flex-col items-center"
            >
                <div className="w-full rounded-lg bg-white p-8 shadow-md">
                    <CurrentStepComponent />
                </div>

                {!isLastCompanyStep && (
                    <div className="mt-8 w-full">
                        <ProgressBar currentStep={currentStepIndex + 1} totalSteps={flow.length} />
                        <NavigationButtons
                            onBack={goToPreviousStep}
                            onNext={goToNextStep}
                            isFirstStep={currentStepIndex === 0}
                            isLastStep={currentStepIndex === flow.length - 1}
                        />
                    </div>
                )}
            </form>
        </FormProvider>
    );
}
