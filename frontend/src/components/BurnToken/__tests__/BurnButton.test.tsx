import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BurnButton } from '../BurnButton';

describe('BurnButton', () => {
  it('renders correctly', () => {
    render(<BurnButton onClick={() => {}} />);
    expect(screen.getByText('Burn Tokens')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<BurnButton onClick={() => {}} loading />);
    expect(screen.getByText('Burning...')).toBeInTheDocument();
    expect(screen.queryByText('Burn Tokens')).not.toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<BurnButton onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading prop is true', () => {
    render(<BurnButton onClick={() => {}} loading />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BurnButton onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders fire icon by default', () => {
    const { container } = render(<BurnButton onClick={() => {}} />);
    expect(container.querySelector('.burn-icon')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(
      <BurnButton onClick={() => {}} showIcon={false} />
    );
    expect(container.querySelector('.burn-icon')).not.toBeInTheDocument();
  });

  it('shows tooltip when enabled', () => {
    render(<BurnButton onClick={() => {}} tooltip="Permanent burn action" />);
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Permanent burn action'
    );
  });

  it('does not render tooltip wrapper when disabled', () => {
    render(<BurnButton onClick={() => {}} tooltip="Burn action" disabled />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('supports size classes through button component', () => {
    render(<BurnButton onClick={() => {}} size="lg" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });
});
