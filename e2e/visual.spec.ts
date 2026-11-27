import { expect, test } from '@playwright/test';

test.describe('Desktop visual regression', () => {
  test.skip(
    !process.env.PLAYWRIGHT_VISUAL,
    'Set PLAYWRIGHT_VISUAL=1 and run "yarn e2e:update" to refresh the baseline.'
  );

  test('showcase matches the visual baseline', async ({ page }) => {
    await page.goto('/iframe.html?id=desktop--showcase&viewMode=story');

    const desktop = page.getByRole('region', { name: 'Desktop' }).first();
    await expect(desktop).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Notes' })).toBeVisible();

    await expect(desktop).toHaveScreenshot('desktop-showcase.png', {
      animations: 'disabled',
      mask: [page.locator('[role="timer"]')]
    });
  });
});
