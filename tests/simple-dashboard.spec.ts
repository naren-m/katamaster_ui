import { test, expect } from '@playwright/test';

test.describe('Simple Dashboard Test', () => {
  test('should load dashboard page with proper routing', async ({ page }) => {
    // Mock authentication to be successful
    await page.route('**/api/auth/validate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User'
        })
      });
    });

    // Mock dashboard analytics API
    await page.route('**/api/users/*/dashboard/analytics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: {
            totalKatasPracticed: 5,
            totalSessions: 12,
            totalRepetitions: 78,
            totalPracticeMinutes: 360,
            averageRating: 7.5,
            currentStreak: 3,
            totalPoints: 890,
            masteredKatas: 1,
            favoriteKata: 'Heian Shodan',
            lastPracticeDate: new Date().toISOString()
          },
          topKatas: [
            {
              kataId: '1',
              kataName: 'Heian Shodan',
              totalRepetitions: 25,
              masteryPercentage: 80,
              mastered: true,
              lastPracticed: new Date().toISOString()
            }
          ],
          progressTrend: [
            { date: '2024-01-24', sessions: 2, repetitions: 8 }
          ]
        })
      });
    });

    // Mock recent activity API
    await page.route('**/api/users/*/recent-activity*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activities: [
            {
              id: '1',
              type: 'kata_practice',
              activityName: 'Heian Shodan Practice',
              description: 'Completed 5 repetitions',
              timestamp: new Date().toISOString(),
              pointsEarned: 25,
              icon: '🥋'
            }
          ],
          total: 1,
          limit: 10
        })
      });
    });

    // Set authentication token before navigating
    await page.addInitScript(() => {
      window.localStorage.setItem('katamaster_token', 'mock-token');
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check if dashboard is visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Check if some stats are displayed
    await expect(page.getByTestId('stat-katas')).toBeVisible();
    await expect(page.getByTestId('stat-sessions')).toBeVisible();
  });

  test('should show sign in when not authenticated', async ({ page }) => {
    // Don't set auth token or mock auth APIs
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should either show sign in page or be redirected to sign in
    const hasSignInForm = await page.locator('input[type="email"]').isVisible();
    const hasSignInMessage = await page.getByText('Sign in to view your dashboard analytics').isVisible();
    
    expect(hasSignInForm || hasSignInMessage).toBe(true);
  });
});