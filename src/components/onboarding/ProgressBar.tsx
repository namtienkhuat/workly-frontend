'use client';

import * as Progress from '@radix-ui/react-progress';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <Progress.Root
            className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
            style={{ transform: 'translateZ(0)' }}
            value={progressPercentage}
        >
            <Progress.Indicator
                className="h-full w-full flex-1 bg-green-600 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
            />
        </Progress.Root>
    );
}
