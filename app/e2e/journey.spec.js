import { test, expect } from '@playwright/test';

test.describe('Kachikaly Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Exploration reveals text on interaction', async ({ page }) => {
    // Increase timeout
    test.setTimeout(60000);

    // Wait for arrival animation to complete visually (approx 10s: 6s delay + 4s fade)
    // We check that the overlay eventually disappears or becomes transparent.
    const arrivalOverlay = page.getByTestId('arrival-root');
    await expect(arrivalOverlay).toBeVisible();

    // Instead of fixed wait, poll for opacity to reach near 0
    await expect.poll(async () => {
      const opacity = await arrivalOverlay.evaluate(el => getComputedStyle(el).opacity);
      return parseFloat(opacity);
    }, {
      timeout: 15000,
      intervals: [500],
    }).toBeLessThan(0.05);

    // Ensure pointer-events are none so clicks pass through
    await expect(arrivalOverlay).toHaveCSS('pointer-events', 'none');

    // Get viewport center
    const viewport = page.viewportSize() || { width: 1280, height: 720 };
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;

    // Start interaction (hold down mouse) to increase depth
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();

    // Wait for depth to increase and reveal first text
    // Depth > 20 needed. Speed ~30 units/s. So ~0.7s.
    // We check for visibility with a generous timeout instead of hard wait.
    await expect(page.getByText('This pool is older than memory.')).toBeVisible({ timeout: 15000 });

    // Continue holding for second text (Depth > 35)
    // This text appears after the first one fades out or is replaced.
    await expect(page.getByText('They have remained when others disappeared.')).toBeVisible({ timeout: 15000 });

    await page.mouse.up();
  });

  test('Idle state hides cursor', async ({ page }) => {
    // Override default timeout
    test.setTimeout(30000);

    // Install fake clock to control time and fast-forward past Arrival phase
    // Note: We need to do this carefully if the app relies on Date.now() or similar.
    // But setTimeout is handled by page.clock.
    await page.clock.install();

    // Fast-forward past the Arrival phase (10s) so we can interact cleanly
    await page.clock.fastForward(11000);

    // Trigger a mouse move to reset the idle timer using the mocked clock
    await page.mouse.move(100, 100);

    // Check initial state (cursor should be grab)
    // We look for the main container which has the cursor style.
    // It's the one with `overflow: hidden` and `width: 100vw`.
    // Since we don't have a specific testid on the root div in PoolView, let's target by style or attribute.
    // However, PoolView renders:
    /*
      <div
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          cursor: isIdle ? 'none' : 'grab',
          ...
        }}
    */
    // We can target the div that is a direct child of #root or similar if we knew the structure.
    // Or just look for any div with `cursor: grab`.
    const container = page.locator('div[style*="cursor: grab"]');
    await expect(container).toBeVisible();

    // Fast forward 2 minutes (120000ms) + buffer
    await page.clock.fastForward(125000);

    // Check if cursor style changed to none
    const idleContainer = page.locator('div[style*="cursor: none"]');
    await expect(idleContainer).toBeVisible();
  });
});
