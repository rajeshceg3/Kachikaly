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
    // We can verify the overlay opacity or just wait.
    // The overlay is `div` with `z-index: 1000`.
    // It fades out to opacity 0.
    // We can check if it's not visible or has opacity 0.
    // However, checking computed style is robust.

    // Instead of fixed wait, let's poll for opacity.
    await expect.poll(async () => {
      const opacity = await page.locator('div[style*="z-index: 1000"]').evaluate(el => getComputedStyle(el).opacity);
      return parseFloat(opacity);
    }, {
      timeout: 10000,
      intervals: [500],
    }).toBeLessThan(0.1);

    // Get viewport center
    const viewport = page.viewportSize();
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;

    // Start interaction
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();

    // Wait for depth to increase and reveal first text
    // Depth > 30 needed. Speed ~30 units/s. So ~1s.
    // We wait 3s to be safe (increased for CI/WebKit).
    await page.waitForTimeout(3000);

    await expect(page.getByText('This pool is older than memory.')).toBeVisible({ timeout: 10000 });

    // Continue holding for second text (Depth > 70)
    // Needs another ~1.5s. Wait 3s more.
    await page.waitForTimeout(3000);

    await expect(page.getByText('They have remained when others disappeared.')).toBeVisible({ timeout: 10000 });

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
