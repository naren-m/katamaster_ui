import { test } from '@playwright/test';

test('simple screenshot', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://192.168.68.138:3000');
  
  // Take screenshot of login page
  await page.screenshot({ path: 'login-page.png', fullPage: true });
  
  // Login
  await page.fill('input[type="email"]', 'demo@katamaster.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  
  // Wait a bit and take another screenshot
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'dashboard-current.png', fullPage: true });
});