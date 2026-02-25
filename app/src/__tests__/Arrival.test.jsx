import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Arrival from '../Arrival';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const MockMotion = ({ children, onAnimationComplete, animate, ...props }) => (
    <div
      data-opacity={animate ? animate.opacity : undefined}
      onClick={onAnimationComplete}
      {...props}
    >
      {children}
    </div>
  );
  return {
    motion: {
      div: MockMotion,
    },
  };
});

describe('Arrival Component', () => {
  it('renders with gradient background and no text', () => {
    render(<Arrival onComplete={() => {}} />);
    const overlay = screen.getByTestId('arrival-root');
    expect(overlay).toBeInTheDocument();

    expect(screen.queryByText('Enter the Sacred Pool')).not.toBeInTheDocument();
    expect(screen.queryByText('Click anywhere to begin')).not.toBeInTheDocument();
  });

  it('triggers onComplete callback after timeout and animation', () => {
    vi.useFakeTimers();
    const handleComplete = vi.fn();
    render(<Arrival onComplete={handleComplete} />);

    const overlay = screen.getByTestId('arrival-root');

    // Initially opacity should be 1
    expect(overlay).toHaveAttribute('data-opacity', '1');

    // Fast-forward time by 6000ms
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // Now opacity should be 0
    expect(overlay).toHaveAttribute('data-opacity', '0');

    // Simulate animation complete (via click mock)
    fireEvent.click(overlay);

    expect(handleComplete).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
