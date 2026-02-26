import { useEffect, useRef, useState } from 'react';

interface TutorialTooltipProps {
    title: string;
    content: string;
    targetElement: HTMLElement | null;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    onNext?: () => void;
    onPrevious?: () => void;
    onSkip?: () => void;
    showPrevious?: boolean;
    showNext?: boolean;
    nextLabel?: string;
}

/**
 * Standalone tooltip component that can be positioned relative to any element
 * Useful for creating custom tutorial flows
 */
export function TutorialTooltip({
    title,
    content,
    targetElement,
    position = 'auto',
    onNext,
    onPrevious,
    onSkip,
    showPrevious = true,
    showNext = true,
    nextLabel = 'Next',
}: TutorialTooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [calculatedPosition, setCalculatedPosition] = useState({ top: 0, left: 0 });
    const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');

    useEffect(() => {
        if (!targetElement || !tooltipRef.current) return;

        const calculatePosition = () => {
            const targetRect = targetElement.getBoundingClientRect();
            const tooltipRect = tooltipRef.current!.getBoundingClientRect();
            const padding = 16;
            const arrowSize = 8;

            let finalPosition = position;

            // Auto-detect best position if set to 'auto'
            if (position === 'auto') {
                const spaceAbove = targetRect.top;
                const spaceBelow = window.innerHeight - targetRect.bottom;
                const spaceLeft = targetRect.left;
                const spaceRight = window.innerWidth - targetRect.right;

                const spaces = [
                    { pos: 'top', space: spaceAbove },
                    { pos: 'bottom', space: spaceBelow },
                    { pos: 'left', space: spaceLeft },
                    { pos: 'right', space: spaceRight },
                ] as const;

                finalPosition = spaces.reduce((max, curr) => 
                    curr.space > max.space ? curr : max
                ).pos;
            }

            let top = 0;
            let left = 0;

            switch (finalPosition) {
                case 'top':
                    top = targetRect.top - tooltipRect.height - padding - arrowSize;
                    left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                    setArrowPosition('bottom');
                    break;
                case 'bottom':
                    top = targetRect.bottom + padding + arrowSize;
                    left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                    setArrowPosition('top');
                    break;
                case 'left':
                    top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                    left = targetRect.left - tooltipRect.width - padding - arrowSize;
                    setArrowPosition('right');
                    break;
                case 'right':
                    top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                    left = targetRect.right + padding + arrowSize;
                    setArrowPosition('left');
                    break;
            }

            // Keep tooltip within viewport
            const maxLeft = window.innerWidth - tooltipRect.width - 16;
            const maxTop = window.innerHeight - tooltipRect.height - 16;
            
            left = Math.max(16, Math.min(left, maxLeft));
            top = Math.max(16, Math.min(top, maxTop));

            setCalculatedPosition({ top, left });
        };

        calculatePosition();
        window.addEventListener('resize', calculatePosition);
        window.addEventListener('scroll', calculatePosition);

        return () => {
            window.removeEventListener('resize', calculatePosition);
            window.removeEventListener('scroll', calculatePosition);
        };
    }, [targetElement, position]);

    const arrowStyles = {
        top: 'bottom-[-8px] left-1/2 -translate-x-1/2 border-t-white border-l-transparent border-r-transparent border-b-transparent',
        bottom: 'top-[-8px] left-1/2 -translate-x-1/2 border-b-white border-l-transparent border-r-transparent border-t-transparent',
        left: 'right-[-8px] top-1/2 -translate-y-1/2 border-l-white border-t-transparent border-b-transparent border-r-transparent',
        right: 'left-[-8px] top-1/2 -translate-y-1/2 border-r-white border-t-transparent border-b-transparent border-l-transparent',
    };

    return (
        <div
            ref={tooltipRef}
            className="fixed z-[10000] bg-white rounded-lg shadow-2xl max-w-sm w-full"
            style={{
                top: `${calculatedPosition.top}px`,
                left: `${calculatedPosition.left}px`,
            }}
        >
            {/* Arrow */}
            <div
                className={`absolute w-0 h-0 border-8 ${arrowStyles[arrowPosition]}`}
            />

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 pr-2">{title}</h3>
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{content}</p>

                <div className="flex gap-2">
                    {showPrevious && onPrevious && (
                        <button
                            onClick={onPrevious}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                    )}
                    {showNext && onNext && (
                        <button
                            onClick={onNext}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {nextLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
