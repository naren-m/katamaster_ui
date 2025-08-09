import { test, expect } from '@playwright/test';

test('quick dashboard data check', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('Browser:', msg.text()));
  page.on('pageerror', err => console.log('Error:', err));

  // Navigate to the app
  await page.goto('http://192.168.68.138:3000');
  
  // Login
  await page.fill('input[type="email"]', 'demo@katamaster.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard
  await page.waitForURL('**/', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // Check for dashboard analytics
  const analyticsComponent = page.locator('[data-testid="dashboard-analytics"]');
  if (await analyticsComponent.isVisible()) {
    console.log('Dashboard analytics component found');
  } else {
    console.log('Dashboard analytics component NOT found');
  }
  
  // Check stats
  const sessionsStat = page.locator('[data-testid="stat-sessions"]');
  if (await sessionsStat.isVisible()) {
    const text = await sessionsStat.textContent();
    console.log('Sessions stat:', text);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'quick-dashboard-check.png', fullPage: true });
});