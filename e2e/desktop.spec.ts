import { expect, test } from '@playwright/test';

const showcase = '/iframe.html?id=desktop--showcase&viewMode=story';

test.describe('Desktop pointer interactions', () => {
  test('drags a window with real pointer input', async ({ page }) => {
    await page.goto(showcase);

    const dialog = page.getByRole('dialog', { name: 'Notes' });
    await expect(dialog).toBeVisible();

    const titlebar = dialog.getByRole('toolbar', { name: 'Window' });
    const before = await dialog.boundingBox();
    const bar = await titlebar.boundingBox();

    expect(before).not.toBeNull();
    expect(bar).not.toBeNull();

    await page.mouse.move(bar!.x + 40, bar!.y + 14);
    await page.mouse.down();
    await page.mouse.move(bar!.x + 160, bar!.y + 94, { steps: 12 });
    await page.mouse.up();

    await expect
      .poll(async () => (await dialog.boundingBox())?.x ?? 0)
      .toBeGreaterThan(before!.x + 80);
    expect((await dialog.boundingBox())!.y).toBeGreaterThan(before!.y + 40);
  });

  test('renders multiple windows and promotes one on click', async ({ page }) => {
    await page.goto('/iframe.html?id=desktop--grouped-windows&viewMode=story');

    const dialogs = page.getByRole('dialog');
    await expect(dialogs).toHaveCount(4);

    const settings = page.getByRole('dialog', { name: 'Settings' });
    await settings.getByRole('toolbar', { name: 'Window' }).click();

    const zIndex = await settings.evaluate((element) => Number(getComputedStyle(element).zIndex));
    const others = await dialogs.evaluateAll((elements) =>
      elements.map((element) => Number(getComputedStyle(element).zIndex))
    );

    expect(zIndex).toBe(Math.max(...others));
  });

  test('opens the snap layout flyout and snaps to the right half', async ({ page }) => {
    await page.goto(showcase);

    const dialog = page.getByRole('dialog', { name: 'Notes' });
    await expect(dialog).toBeVisible();

    const maximize = dialog.getByRole('button', { name: /^Maximize/ });
    await maximize.hover();

    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    await menu.getByRole('menuitem', { name: 'Right half' }).click();

    const viewport = page.viewportSize();
    await expect
      .poll(async () => (await dialog.boundingBox())?.width ?? 0)
      .toBeGreaterThan(viewport!.width * 0.4);
    await expect
      .poll(async () => (await dialog.boundingBox())?.x ?? 0)
      .toBeGreaterThan(viewport!.width * 0.4);
  });

  test('opens the calendar flyout and shows widgets', async ({ page }) => {
    await page.goto('/iframe.html?id=desktop--widgets-and-calendar&viewMode=story');

    await expect(page.getByText('World clock')).toBeVisible();

    await page.getByRole('button', { name: 'Calendar' }).click();

    const calendar = page.getByRole('dialog', { name: 'Calendar' });
    await expect(calendar).toBeVisible();
    await expect(calendar.getByRole('button', { name: 'Close calendar' })).toBeVisible();

    await calendar.getByRole('button', { name: 'Close calendar' }).click();
    await expect(calendar).not.toBeVisible();
  });

  test('selects wallpaper icons with Ctrl+click and clears with Escape', async ({ page }) => {
    await page.goto('/iframe.html?id=desktop--widgets-and-calendar&viewMode=story');

    const mail = page.getByRole('button', { name: 'Mail' });
    await mail.click({ modifiers: ['Control'] });

    await expect(mail).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('Escape');

    await expect(mail).toHaveAttribute('aria-pressed', 'false');
  });

  test('uses compact mode on a small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await page.goto('/iframe.html?id=desktop--compact-layout&viewMode=story');

    await expect(page.locator('[data-compact="true"]')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Notes' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Minimize/ })).toBeVisible();
  });
});
