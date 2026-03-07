import { useState } from 'react';
import { Button } from '../UI/Button';
import { Tooltip } from '../UI/Tooltip';
import { FireIcon } from '../UI/Icons';
import './BurnButton.css';

interface BurnButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  tooltip?: string;
  className?: string;
}

const VALID_SIZES = ['sm', 'md', 'lg'] as const;

export function BurnButton({
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  showIcon = true,
  tooltip = 'Burn tokens permanently',
  className = '',
}: BurnButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDisabled = disabled || loading;
  const resolvedSize = VALID_SIZES.includes(size) ? size : 'md';

  const buttonContent = (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      variant="danger"
      size={resolvedSize}
      className={`burn-button ${className}`.trim()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Burn tokens"
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      data-hovered={isHovered}
    >
      {loading ? (
        <span className="burn-button-content">
          <span
            className={`burn-spinner burn-spinner--${resolvedSize}`}
            aria-hidden="true"
          />
          <span>Burning...</span>
        </span>
      ) : (
        <span className="burn-button-content">
          {showIcon && (
            <FireIcon className={`burn-icon burn-icon--${resolvedSize}`} />
          )}
          <span>Burn Tokens</span>
        </span>
      )}
    </Button>
  );

  if (tooltip && !isDisabled) {
    return (
      <Tooltip content={tooltip} position="top">
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
}
