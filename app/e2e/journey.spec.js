import { test, expect } from '@playwright/test';

test.describe('Kachikaly Experience', () => {
  // We'll handle navigation manually in tests where specific setup (like clock) is needed
  // or use beforeEach if it's common.
  // Let's keep beforeEach simple.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Exploration reveals text on interaction', async ({ page }) => {
    // Increase timeout
    test.setTimeout(60000);

    // Wait for arrival animation to complete visually (approx 8s)
    // Wait for "Click anywhere to begin" text to be visible
    const startText = page.getByText('Click anywhere to begin');
    await expect(startText).toBeVisible({ timeout: 10000 });

    // Click anywhere to start the interaction (center of viewport)
    let viewport = page.viewportSize();
    if (!viewport) viewport = { width: 1280, height: 720 };

    await page.mouse.click(viewport.width / 2, viewport.height / 2);

    // Instead of fixed wait, let's poll for opacity.
    // The opacity decreases over 4 seconds after click.
    await expect.poll(async () => {
      const opacity = await page.locator('div[style*="z-index: 1000"]').evaluate(el => getComputedStyle(el).opacity);
      return parseFloat(opacity);
    }, {
      timeout: 10000,
      intervals: [500],
    }).toBeLessThan(0.1);

    // Get viewport center
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;

    // Start interaction
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();

    // Wait for depth to increase and reveal first text
    // Depth > 20 needed. Speed ~30 units/s. So ~0.7s.
    // We check for visibility with a generous timeout instead of hard wait.
    await expect(page.getByText('This pool is older than memory.')).toBeVisible({ timeout: 15000 });

    // Continue holding for second text (Depth > 35)
    // This text appears after the first one fades out or is replaced.
    // The previous text range is 20-35, next is 35-50.
    // We need to keep holding down until the next text appears.
    // Since we are already holding down, depth increases continuously.

    await expect(page.getByText('They have remained when others disappeared.')).toBeVisible({ timeout: 15000 });

    await page.mouse.up();
  });

  test('Idle state hides cursor', async ({ page }) => {
    // Override default timeout
    test.setTimeout(30000);

    // Install fake clock to control time
    await page.clock.install();

    // Trigger a mouse move to reset the idle timer using the mocked clock
    await page.mouse.move(100, 100);

    // Check initial state (cursor should be grab)
    // We look for the main container which has the cursor style.
    // It's the one with `overflow: hidden` and `width: 100vw`.
    const container = page.locator('div[style*="cursor: grab"]');
    await expect(container).toBeVisible();

    // Fast forward 2 minutes + buffer
    await page.clock.fastForward(125000);

    // Check if cursor style changed to none
    // The element style attribute changes.
    const idleContainer = page.locator('div[style*="cursor: none"]');
    await expect(idleContainer).toBeVisible();
  });
});
