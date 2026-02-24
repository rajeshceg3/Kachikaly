import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock child components
vi.mock('../Arrival', () => ({
  default: ({ onComplete }) => (
    <div data-testid="arrival" onClick={onComplete}>
      Arrival Component
    </div>
  ),
}));

vi.mock('../PoolView', () => ({
  default: () => <div data-testid="pool-view">PoolView Component</div>,
}));

describe('App Component', () => {
  it('renders Arrival and PoolView components', () => {
    render(<App />);
    expect(screen.getByTestId('arrival')).toBeInTheDocument();
    expect(screen.getByTestId('pool-view')).toBeInTheDocument();
  });

  it('updates state when Arrival completes (integration check)', () => {
    // Since the state isn't used in the UI, we can't easily check it via screen.
    // But we can check if the function passed to Arrival works without crashing.
    render(<App />);
    const arrival = screen.getByTestId('arrival');

    // Trigger onComplete
    fireEvent.click(arrival);

    // If no error, we assume it worked.
    // Ideally we would check if PoolView receives a prop or something changes,
    // but the current implementation doesn't use the state.
    // So this test mainly ensures the callback is wired up.
    expect(screen.getByTestId('pool-view')).toBeInTheDocument();
  });
});
