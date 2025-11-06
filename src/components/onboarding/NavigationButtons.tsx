'use client';

import { useRouter } from 'next/navigation';

interface NavigationButtonsProps {
    onBack: () => void;
    onNext: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    isDisabled?: boolean;
}

export default function NavigationButtons({
    onBack,
    onNext,
    isFirstStep,
    isLastStep,
}: NavigationButtonsProps) {
    const router = useRouter();

    const handleBackClick = () => {
        if (isFirstStep) {
            router.push('/select-role');
        } else {
            onBack();
        }
    };
    return (
        <div className="mt-8 flex w-full justify-between">
            <button
                onClick={handleBackClick}
                className="rounded-md px-6 py-2 font-semibold text-gray-600 border border-transparent hover:bg-gray-100 hover:border-green-700 transition"
            >
                Go back
            </button>

            <button
                onClick={onNext}
                className="rounded-md bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700"
            >
                {isLastStep ? 'Complate' : 'Continue'}
            </button>
        </div>
    );
}
