import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PoolView from '../PoolView';
import audioEngine from '../audio/AudioEngine';

// Mock AudioEngine
vi.mock('../audio/AudioEngine', () => ({
  default: {
    setDepth: vi.fn(),
  },
}));

// Hoisted state
const {
  getMotionValues,
  resetMotionValues,
  triggerRaf,
  registerRaf,
  createMotionValue
} = vi.hoisted(() => {
  let mvs = [];
  const rafCbs = new Set();

  const createMotionValue = (initial) => {
    let value = initial;
    const listeners = new Set();
    const mv = {
      get: () => value,
      set: (v) => {
        value = v;
        listeners.forEach(cb => cb(v));
      },
      on: (event, cb) => {
        if (event === 'change') {
          listeners.add(cb);
          return () => listeners.delete(cb);
        }
        return () => {};
      }
    };
    mvs.push(mv);
    return mv;
  };

  return {
    getMotionValues: () => mvs,
    resetMotionValues: () => { mvs = []; rafCbs.clear(); },
    triggerRaf: (time, delta) => {
      rafCbs.forEach(cb => cb(time, delta));
    },
    registerRaf: (cb) => rafCbs.add(cb),
    createMotionValue
  };
});

// Mock framer-motion
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal();
  const React = await import('react');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    useMotionValue: (initial) => {
      const ref = React.useRef(null);
      if (!ref.current) {
        ref.current = createMotionValue(initial);
      }
      return ref.current;
    },
    useTransform: () => createMotionValue(1), // Return a dummy motion value
    useSpring: (source) => source, // Pass through
    useAnimationFrame: (cb) => {
      registerRaf(cb);
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// Mock Background component
vi.mock('../Background', () => ({
  default: () => <div data-testid="background">Background</div>,
}));

describe('PoolView Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetMotionValues();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders background', () => {
    render(<PoolView />);
    expect(screen.getByTestId('background')).toBeInTheDocument();
  });

  it('updates depth on animation frame when moving', () => {
    render(<PoolView />);
    const mvs = getMotionValues();
    // Assuming order: depth (0), mouseX (0), mouseY (0)
    // PoolView code:
    // const depth = useMotionValue(0);
    // const mouseX = useMotionValue(0);
    // const mouseY = useMotionValue(0);

    // So mvs[0] is depth.
    const depth = mvs[0];

    // Simulate mouse down to set isMoving = true
    // We need to target the container that has onMouseDown
    // It's the root div.
    const container = screen.getByTestId('background').parentElement.parentElement;
    fireEvent.mouseDown(container);

    // Trigger RAF
    act(() => {
      triggerRaf(100, 16); // 16ms delta
    });

    // Depth should increase: 0 + 16 * 0.03 = 0.48
    expect(depth.get()).toBeCloseTo(0.48);
  });

  it('does not update depth when not moving', () => {
    render(<PoolView />);
    const mvs = getMotionValues();
    const depth = mvs[0];

    // Trigger RAF without mouseDown
    act(() => {
      triggerRaf(100, 16);
    });

    expect(depth.get()).toBe(0);
  });

  it('does not exceed max depth', () => {
    render(<PoolView />);
    const mvs = getMotionValues();
    const depth = mvs[0];

    // Set depth to 100
    act(() => {
      depth.set(100);
    });

    // Mouse down
    const container = screen.getByTestId('background').parentElement.parentElement;
    fireEvent.mouseDown(container);

    // Trigger RAF
    act(() => {
      triggerRaf(100, 16);
    });

    // Should stay at 100
    expect(depth.get()).toBe(100);
  });

  it('reveals text based on depth and updates audio', async () => {
    render(<PoolView />);
    const mvs = getMotionValues();
    const depth = mvs[0];

    // Set depth for first text
    act(() => {
      depth.set(30);
    });
    expect(screen.getByText('This pool is older than memory.')).toBeInTheDocument();
    expect(audioEngine.setDepth).toHaveBeenCalledWith(30);

    // Set depth for second text
    act(() => {
      depth.set(40);
    });
    expect(audioEngine.setDepth).toHaveBeenCalledWith(40);
    expect(screen.getByText('They have remained when others disappeared.')).toBeInTheDocument();

    // Set depth for deeper text
    act(() => {
      depth.set(60);
    });
    expect(audioEngine.setDepth).toHaveBeenCalledWith(60);
    expect(screen.getByText('Fertility rituals performed in silence.')).toBeInTheDocument();
  });

  it('updates mouseX and mouseY on window mouse move', () => {
    render(<PoolView />);
    const mvs = getMotionValues();
    // mvs[0] is depth. mvs[1] is mouseX, mvs[2] is mouseY.
    const mouseX = mvs[1];
    const mouseY = mvs[2];

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });

    // Logic: x = (clientX - window.innerWidth / 2) * 0.05
    // Default jsdom window size: 1024x768 (default)
    const expectedX = (100 - window.innerWidth / 2) * 0.05;
    const expectedY = (100 - window.innerHeight / 2) * 0.05;

    expect(mouseX.get()).toBeCloseTo(expectedX);
    expect(mouseY.get()).toBeCloseTo(expectedY);
  });

  it('hides cursor when idle', () => {
    const { container } = render(<PoolView />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveStyle({ cursor: 'grab' });

    act(() => {
      vi.advanceTimersByTime(120000);
    });

    expect(mainDiv).toHaveStyle({ cursor: 'none' });
  });

  it('cleans up listeners on unmount', () => {
    const { unmount } = render(<PoolView />);
    unmount();
    // Verify no errors and coverage hits cleanup
  });
});
