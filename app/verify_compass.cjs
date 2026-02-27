const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app
  console.log('Navigating to app...');
  await page.goto('http://localhost:3000');

  // Wait for Arrival phase (10s: 6s delay + 4s fade)
  console.log('Waiting for Arrival phase...');
  // Check for arrival-root initially visible
  try {
      await page.waitForSelector('[data-testid="arrival-root"]', { timeout: 5000 });
  } catch (e) {
      console.log('Arrival root not found immediately, might have faded already.');
  }

  // Wait for 11 seconds to be safe
  await page.waitForTimeout(11000);

  // Now we should be in PoolView.
  console.log('Arrival complete. Waiting for hesitation (compass)...');

  // Wait for 6 seconds (hesitation timer is 5s)
  await page.waitForTimeout(6000);

  // Check compass visibility
  const compass = page.locator('[data-testid="compass"]');
  if (await compass.isVisible()) {
      console.log('Compass is visible (Correct).');
  } else {
      console.error('Compass is NOT visible (Incorrect).');
  }

  await page.screenshot({ path: '/home/jules/verification/compass_visible.png' });

  await browser.close();
})();
