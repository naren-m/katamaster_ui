import { test, expect } from '@playwright/test';

test.describe('Dashboard Error Handling', () => {
  test('should show backend unavailable message when service is down', async ({ page }) => {
    // Navigate to dashboard page
    await page.goto('/dashboard');
    
    // Wait for the error state to appear
    await expect(page.getByText('Dashboard Unavailable')).toBeVisible({ timeout: 10000 });
    
    // Check for proper error message
    await expect(page.getByText('Unable to connect to the backend service')).toBeVisible();
    
    // Verify retry button is present
    await expect(page.getByRole('button', { name: /Retry Connection/i })).toBeVisible();
    
    // Check for helpful instruction text
    await expect(page.getByText('If this issue persists, please check that the backend service is running')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate to dashboard page
    await page.goto('/dashboard');
    
    // Should show loading state first
    await expect(page.getByText('Loading analytics...')).toBeVisible({ timeout: 5000 });
  });

  test('should show sign in message when not authenticated', async ({ page }) => {
    // Clear any existing auth tokens
    await page.evaluate(() => {
      localStorage.removeItem('katamaster_token');
      localStorage.removeItem('katamaster_user');
    });
    
    await page.goto('/dashboard');
    
    // Should show sign in message
    await expect(page.getByText('Sign in to view your dashboard analytics')).toBeVisible({ timeout: 5000 });
  });
});