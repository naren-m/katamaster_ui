import { test, expect } from '@playwright/test';

test('test dashboard after Docker rebuild', async ({ page }) => {
  // Enable console logging to capture our debug logs
  page.on('console', msg => console.log('🔍 Browser Console:', msg.text()));
  page.on('pageerror', err => console.log('❌ Page Error:', err));

  // Navigate to the app
  await page.goto('http://192.168.68.138:3000');
  
  // Login
  await page.fill('input[type="email"]', 'demo@katamaster.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard to load
  await page.waitForURL('**/', { timeout: 10000 });
  await page.waitForTimeout(8000); // Give time for API calls and data processing
  
  // Take screenshot
  await page.screenshot({ path: 'dashboard-after-rebuild.png', fullPage: true });
  
  // Check for dashboard analytics component
  const analyticsComponent = page.locator('[data-testid="dashboard-analytics"]');
  await expect(analyticsComponent).toBeVisible();
  
  // Check specific stats
  const sessionsStatElement = page.locator('[data-testid="stat-sessions"]');
  const katasStatElement = page.locator('[data-testid="stat-katas"]');
  const repetitionsStatElement = page.locator('[data-testid="stat-repetitions"]');
  
  if (await sessionsStatElement.isVisible()) {
    const sessionsText = await sessionsStatElement.textContent();
    console.log('📊 Sessions stat:', sessionsText);
  }
  
  if (await katasStatElement.isVisible()) {
    const katasText = await katasStatElement.textContent();
    console.log('📊 Katas stat:', katasText);
  }
  
  if (await repetitionsStatElement.isVisible()) {
    const repetitionsText = await repetitionsStatElement.textContent();
    console.log('📊 Repetitions stat:', repetitionsText);
  }
  
  console.log('✅ Dashboard test completed');
});