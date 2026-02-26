// Example: Using Stellar Error Handling in a React Component

import { useState } from 'react';
import { StellarService, StellarError } from './services';
import type { TokenDeployParams } from './types';

export function TokenDeploymentForm() {
    const [error, setError] = useState<StellarError | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDeploy = async (params: TokenDeployParams) => {
        setError(null);
        setLoading(true);

        try {
            const service = new StellarService('testnet');
            const result = await service.deployToken(params);
            
            console.log('Token deployed:', result.tokenAddress);
            console.log('Transaction:', result.transactionHash);
            
        } catch (err) {
            if (err instanceof StellarError) {
                setError(err);
                
                // Log for debugging
                console.error('Deployment failed:', {
                    code: err.code,
                    message: err.message,
                    details: err.details,
                    retryable: err.retryable,
                });
            } else {
                // Unexpected error
                console.error('Unexpected error:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Error Display */}
            {error && (
                <div className="error-banner">
                    <h3>{error.message}</h3>
                    {error.details && <p>{error.details}</p>}
                    
                    {error.retryable && error.retrySuggestion && (
                        <div className="retry-section">
                            <p>💡 {error.retrySuggestion}</p>
                            <button onClick={() => handleDeploy(params)}>
                                Try Again
                            </button>
                        </div>
                    )}
                    
                    {!error.retryable && (
                        <p className="permanent-error">
                            This error cannot be automatically resolved.
                        </p>
                    )}
                </div>
            )}

            {/* Form UI */}
            <form onSubmit={(e) => {
                e.preventDefault();
                // ... get form data
                handleDeploy(formData);
            }}>
                {/* Form fields */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Deploying...' : 'Deploy Token'}
                </button>
            </form>
        </div>
    );
}
