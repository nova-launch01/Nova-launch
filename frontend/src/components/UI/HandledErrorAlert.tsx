import { ErrorHandler } from '../../utils/errors';
import type { AppError } from '../../types';
import { Button } from './Button';

interface HandledErrorAlertProps {
    error: unknown;
    title?: string;
    className?: string;
    onRecoveryAction?: () => void;
    recoveryActionLabel?: string;
}

function toError(input: unknown): Error {
    if (input instanceof Error) {
        return input;
    }

    if (
        typeof input === 'object' &&
        input !== null &&
        'message' in input &&
        typeof (input as AppError).message === 'string'
    ) {
        const appError = input as AppError;
        return new Error(appError.details ? `${appError.message}: ${appError.details}` : appError.message);
    }

    if (typeof input === 'string') {
        return new Error(input);
    }

    return new Error('An unknown error occurred');
}

export function HandledErrorAlert({
    error,
    title = 'Something went wrong',
    className = '',
    onRecoveryAction,
    recoveryActionLabel = 'Try Recovery',
}: HandledErrorAlertProps) {
    const normalizedError = toError(error);
    const handled = ErrorHandler.toHandledError(normalizedError);

    return (
        <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`} role="alert">
            <h4 className="font-medium text-red-800">{title}</h4>
            <p className="mt-2 text-sm text-red-700">{handled.message}</p>
            <p className="mt-2 text-sm text-red-700">
                <span className="font-medium">Suggested recovery:</span> {handled.recoverySuggestion}
            </p>
            {onRecoveryAction ? (
                <Button className="mt-3" variant="danger" onClick={onRecoveryAction}>
                    {recoveryActionLabel}
                </Button>
            ) : null}
        </div>
    );
}