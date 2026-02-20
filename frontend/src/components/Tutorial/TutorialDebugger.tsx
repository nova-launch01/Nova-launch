import { useState, useEffect } from 'react';
import { tutorialAnalytics } from './tutorialAnalytics';
import { tutorialRecorder } from './TutorialRecorder';
import { TutorialProgressManager } from './tutorialProgress';

interface TutorialDebuggerProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Tutorial Debugger - Development tool for testing and debugging tutorials
 * Only use in development mode
 */
export function TutorialDebugger({ isOpen, onClose }: TutorialDebuggerProps) {
    const [activeTab, setActiveTab] = useState<'analytics' | 'recorder' | 'progress'>('analytics');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedSession, setRecordedSession] = useState<any>(null);

    useEffect(() => {
        setIsRecording(tutorialRecorder.isActive());
    }, []);

    if (!isOpen) return null;

    const handleStartRecording = () => {
        tutorialRecorder.start();
        setIsRecording(true);
    };

    const handleStopRecording = () => {
        const session = tutorialRecorder.stop();
        setIsRecording(false);
        setRecordedSession(session);
        if (session) {
            tutorialRecorder.saveSession(session);
        }
    };

    const handleExportSession = () => {
        if (recordedSession) {
            const json = tutorialRecorder.exportSession(recordedSession);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tutorial-session-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleGenerateSteps = () => {
        if (recordedSession) {
            const steps = tutorialRecorder.generateTutorialSteps(recordedSession);
            console.log('Generated Tutorial Steps:', steps);
            alert('Tutorial steps generated! Check console for details.');
        }
    };

    const analytics = tutorialAnalytics.getStoredAnalytics();
    const progress = TutorialProgressManager.load();
    const savedSessions = tutorialRecorder.getSavedSessions();

    return (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Tutorial Debugger</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'analytics'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('recorder')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'recorder'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Recorder
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'progress'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Progress
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'analytics' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Analytics Events</h3>
                                <button
                                    onClick={() => tutorialAnalytics.clearAnalytics()}
                                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                >
                                    Clear All
                                </button>
                            </div>
                            {analytics.length > 0 ? (
                                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                        {JSON.stringify(analytics, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No analytics data available</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'recorder' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Session Recorder</h3>
                                <div className="flex gap-2">
                                    {!isRecording ? (
                                        <button
                                            onClick={handleStartRecording}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            ● Start Recording
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleStopRecording}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            ■ Stop Recording
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isRecording && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">Recording in progress...</p>
                                    <p className="text-red-600 text-sm mt-1">
                                        Interact with the app to record actions
                                    </p>
                                </div>
                            )}

                            {recordedSession && (
                                <div className="space-y-3">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-800 font-medium">Session Recorded!</p>
                                        <p className="text-green-600 text-sm mt-1">
                                            {recordedSession.actions.length} actions captured
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleExportSession}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Export JSON
                                        </button>
                                        <button
                                            onClick={handleGenerateSteps}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Generate Steps
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                            {JSON.stringify(recordedSession, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {savedSessions.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                        Saved Sessions ({savedSessions.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {savedSessions.map((session, index) => (
                                            <div
                                                key={session.id}
                                                className="bg-gray-50 rounded p-3 text-sm"
                                            >
                                                <p className="font-medium text-gray-900">
                                                    Session {index + 1}
                                                </p>
                                                <p className="text-gray-600 text-xs">
                                                    {session.actions.length} actions •{' '}
                                                    {new Date(session.startTime).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Tutorial Progress</h3>
                            {progress ? (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                        {JSON.stringify(progress, null, 2)}
                                    </pre>
                                    <button
                                        onClick={() => {
                                            TutorialProgressManager.clear();
                                            alert('Progress cleared!');
                                        }}
                                        className="mt-3 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                    >
                                        Clear Progress
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No progress data available</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
