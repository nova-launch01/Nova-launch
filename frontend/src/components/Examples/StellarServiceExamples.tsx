import { useTokenInfo, useTransactionMonitor } from '../../hooks/useStellar';

export function TokenInfoDisplay({ tokenAddress }: { tokenAddress: string }) {
  const { tokenInfo, loading, error, fetchTokenInfo } = useTokenInfo('testnet');

  return (
    <div>
      <button onClick={() => fetchTokenInfo(tokenAddress)} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Token Info'}
      </button>
      
      {error && <p className="text-red-600">{error}</p>}
      
      {tokenInfo && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold">{tokenInfo.name} ({tokenInfo.symbol})</h3>
          <p>Decimals: {tokenInfo.decimals}</p>
          <p>Total Supply: {tokenInfo.totalSupply}</p>
          <p>Creator: {tokenInfo.creator}</p>
          {tokenInfo.metadataUri && <p>Metadata: {tokenInfo.metadataUri}</p>}
        </div>
      )}
    </div>
  );
}

export function TransactionMonitor({ txHash }: { txHash: string }) {
  const { status, error, monitorTransaction } = useTransactionMonitor('testnet');

  return (
    <div>
      <button onClick={() => monitorTransaction(txHash)}>
        Monitor Transaction
      </button>
      
      {error && <p className="text-red-600">{error}</p>}
      
      {status && (
        <div className="mt-4 p-4 border rounded">
          <p>Status: <span className={
            status.status === 'success' ? 'text-green-600' :
            status.status === 'failed' ? 'text-red-600' :
            'text-yellow-600'
          }>{status.status}</span></p>
          <p>Hash: {status.hash}</p>
          {status.fee !== '0' && <p>Fee: {status.fee} stroops</p>}
        </div>
      )}
    </div>
  );
}
