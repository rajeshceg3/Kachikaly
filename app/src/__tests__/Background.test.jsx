import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Background from '../Background';

describe('Background Component', () => {
  it('renders without crashing', () => {
    render(<Background />);
  });
});
