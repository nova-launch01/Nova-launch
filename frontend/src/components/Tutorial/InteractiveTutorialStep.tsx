import { useState } from 'react';
import { Button } from '../UI/Button';

interface InteractiveTutorialStepProps {
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    onComplete: () => void;
}

/**
 * Interactive tutorial step that requires user action
 * Useful for steps where the user needs to perform an actual task
 */
export function InteractiveTutorialStep({
    title,
    description,
    actionLabel,
    onAction,
    onComplete,
}: InteractiveTutorialStepProps) {
    const [actionCompleted, setActionCompleted] = useState(false);

    const handleAction = () => {
        onAction();
        setActionCompleted(true);
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>

            {!actionCompleted ? (
                <Button onClick={handleAction} className="w-full">
                    {actionLabel}
                </Button>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-sm font-medium">Action completed!</span>
                    </div>
                    <Button onClick={onComplete} className="w-full">
                        Continue
                    </Button>
                </div>
            )}
        </div>
    );
}
