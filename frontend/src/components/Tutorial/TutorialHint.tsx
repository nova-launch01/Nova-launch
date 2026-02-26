import { useState } from 'react';

interface TutorialHintProps {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
}

/**
 * Inline tutorial hint that appears on hover
 * Useful for providing contextual help without interrupting the flow
 */
export function TutorialHint({ content, position = 'top', children }: TutorialHintProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            
            {isVisible && (
                <div
                    className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
                    role="tooltip"
                >
                    <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-lg">
                        {content}
                        <div
                            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                                position === 'top'
                                    ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                                    : position === 'bottom'
                                    ? 'top-[-4px] left-1/2 -translate-x-1/2'
                                    : position === 'left'
                                    ? 'right-[-4px] top-1/2 -translate-y-1/2'
                                    : 'left-[-4px] top-1/2 -translate-y-1/2'
                            }`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
