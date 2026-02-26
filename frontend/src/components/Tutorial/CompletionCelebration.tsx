import { useEffect, useState } from 'react';
import { Button } from '../UI/Button';

interface CompletionCelebrationProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CompletionCelebration({ isOpen, onClose }: CompletionCelebrationProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black bg-opacity-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebration-title"
        >
            <div
                className={`bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center transform transition-all duration-500 ${
                    show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                {/* Celebration Icon */}
                <div className="mb-6 relative">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                        <svg
                            className="w-10 h-10 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    {/* Confetti effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-blue-500 rounded-full animate-ping"
                                style={{
                                    animationDelay: `${i * 0.1}s`,
                                    transform: `rotate(${i * 45}deg) translateY(-40px)`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <h2 id="celebration-title" className="text-2xl font-bold text-gray-900 mb-3">
                    Congratulations! 🎉
                </h2>
                <p className="text-gray-600 mb-6">
                    You've completed the tutorial and are ready to deploy your first token on Stellar!
                </p>

                {/* Action */}
                <Button onClick={onClose} className="w-full">
                    Start Deploying
                </Button>
            </div>
        </div>
    );
}
