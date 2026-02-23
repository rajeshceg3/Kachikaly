import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Arrival from '../Arrival';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationComplete, ...props }) => (
      <div
        data-testid="arrival-overlay"
        data-onanimationcomplete={onAnimationComplete ? 'true' : 'false'}
        // We attach the handler to onClick for easy triggering in tests
        onClick={onAnimationComplete}
        {...props}
      >
        {children}
      </div>
    ),
  },
}));

describe('Arrival Component', () => {
  it('renders the overlay initially', () => {
    render(<Arrival onComplete={() => {}} />);
    const overlay = screen.getByTestId('arrival-overlay');
    expect(overlay).toBeInTheDocument();

    // Check style props to ensure it covers the screen
    expect(overlay).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgb(0, 0, 0)', // #000000
    });
  });

  it('triggers onComplete callback when animation finishes', () => {
    const handleComplete = vi.fn();
    render(<Arrival onComplete={handleComplete} />);

    const overlay = screen.getByTestId('arrival-overlay');

    // Simulate animation completion
    fireEvent.click(overlay);

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});
