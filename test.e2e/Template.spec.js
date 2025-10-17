import { test, expect } from '@playwright/test';

test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('src/App.vue has been loaded successfully');
  await expect(page.locator('h2')).toHaveText('You are currently accessing src/views/HomeView.vue');
})
