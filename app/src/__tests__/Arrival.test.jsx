import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Arrival from '../Arrival';
import audioEngine from '../audio/AudioEngine';

// Mock AudioEngine
vi.mock('../audio/AudioEngine', () => ({
  default: {
    play: vi.fn(),
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
  const MockMotion = ({ children, onAnimationComplete, ...props }) => (
    <div
      onClick={onAnimationComplete} // Used to simulate animation completion in test
      {...props}
    >
      {children}
    </div>
  );
  return {
    motion: {
      div: MockMotion,
      h1: MockMotion,
      p: MockMotion,
    },
  };
});

describe('Arrival Component', () => {
  it('renders with gradient background and text', () => {
    render(<Arrival onComplete={() => {}} />);
    const overlay = screen.getByTestId('arrival-root');
    expect(overlay).toBeInTheDocument();

    expect(overlay).toHaveStyle({
      background: 'linear-gradient(to bottom, #000000 0%, #1a1510 100%)',
    });

    expect(screen.getByText('Enter the Sacred Pool')).toBeInTheDocument();
    expect(screen.getByText('Click anywhere to begin')).toBeInTheDocument();
  });

  it('triggers audio on window interaction', () => {
    render(<Arrival onComplete={() => {}} />);

    // Simulate interaction on window (e.g., click)
    fireEvent.click(window);

    expect(audioEngine.play).toHaveBeenCalled();
  });

  it('triggers onComplete callback when animation finishes after interaction', () => {
    const handleComplete = vi.fn();
    render(<Arrival onComplete={handleComplete} />);

    const overlay = screen.getByTestId('arrival-root');

    // Initial click to set hasInteracted = true (simulate user interaction)
    fireEvent.click(window);

    // Simulate animation completion via the mocked onClick handler
    // In the real component, this happens automatically after animation duration.
    // In the mock, we simulate it by clicking the element (since we mapped onClick to onAnimationComplete)
    fireEvent.click(overlay);

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});
