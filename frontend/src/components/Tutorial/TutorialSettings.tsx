import { useState } from 'react';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { tutorialAnalytics } from './tutorialAnalytics';

interface TutorialSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onResetTutorial: () => void;
}

export function TutorialSettings({ isOpen, onClose, onResetTutorial }: TutorialSettingsProps) {
    const [showAnalytics, setShowAnalytics] = useState(false);
    const analytics = tutorialAnalytics.getStoredAnalytics();

    const handleReset = () => {
        if (confirm('Are you sure you want to reset the tutorial? This will allow you to see it again.')) {
            onResetTutorial();
            onClose();
        }
    };

    const handleClearAnalytics = () => {
        if (confirm('Clear all tutorial analytics data?')) {
            tutorialAnalytics.clearAnalytics();
            setShowAnalytics(false);
        }
    };

    const getAnalyticsStats = () => {
        const completed = analytics.filter(e => e.type === 'completed').length;
        const skipped = analytics.filter(e => e.type === 'skipped').length;
        const started = analytics.filter(e => e.type === 'started').length;
        
        return { completed, skipped, started };
    };

    const stats = getAnalyticsStats();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tutorial Settings"
            size="md"
        >
            <div className="space-y-6">
                {/* Reset Tutorial */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Reset Tutorial</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Reset your tutorial progress to see it again from the beginning.
                    </p>
                    <Button variant="outline" onClick={handleReset}>
                        Reset Tutorial
                    </Button>
                </div>

                {/* Analytics */}
                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Tutorial Analytics</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        View your tutorial usage statistics (stored locally).
                    </p>
                    
                    {analytics.length > 0 ? (
                        <>
                            <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{stats.started}</div>
                                        <div className="text-xs text-gray-600">Started</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                                        <div className="text-xs text-gray-600">Completed</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-600">{stats.skipped}</div>
                                        <div className="text-xs text-gray-600">Skipped</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowAnalytics(!showAnalytics)}
                                >
                                    {showAnalytics ? 'Hide Details' : 'Show Details'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleClearAnalytics}
                                >
                                    Clear Data
                                </Button>
                            </div>

                            {showAnalytics && (
                                <div className="mt-3 max-h-48 overflow-y-auto bg-gray-50 rounded p-3">
                                    <pre className="text-xs text-gray-700">
                                        {JSON.stringify(analytics, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No analytics data available yet.</p>
                    )}
                </div>

                {/* Info */}
                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-xs text-gray-600">
                        Tutorial data is stored locally in your browser and never sent to any server. 
                        You can clear it at any time.
                    </p>
                </div>
            </div>
        </Modal>
    );
}
