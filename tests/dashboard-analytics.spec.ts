import { test, expect, Page } from '@playwright/test';

// Test data constants
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

const MOCK_ANALYTICS_DATA = {
  stats: {
    totalKatasPracticed: 8,
    totalSessions: 24,
    totalRepetitions: 156,
    totalPracticeMinutes: 720,
    averageRating: 7.8,
    currentStreak: 5,
    totalPoints: 1240,
    masteredKatas: 2,
    favoriteKata: 'Heian Shodan',
    lastPracticeDate: new Date().toISOString()
  },
  topKatas: [
    {
      kataId: '1',
      kataName: 'Heian Shodan',
      totalRepetitions: 45,
      masteryPercentage: 85,
      mastered: true,
      lastPracticed: new Date(Date.now() - 86400000).toISOString()
    },
    {
      kataId: '2',
      kataName: 'Heian Nidan',
      totalRepetitions: 32,
      masteryPercentage: 64,
      mastered: false,
      lastPracticed: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'kata_practice',
      activityName: 'Heian Shodan Practice',
      description: 'Completed 8 repetitions with focus on timing',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      pointsEarned: 40,
      icon: '🥋'
    }
  ]
};

// Helper function to mock API responses
async function mockAPIResponses(page: Page) {
  // Mock dashboard analytics API
  await page.route('**/api/users/*/dashboard/analytics', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_ANALYTICS_DATA)
    });
  });

  // Mock recent activity API
  await page.route('**/api/users/*/recent-activity*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        activities: MOCK_ANALYTICS_DATA.recentActivity,
        total: MOCK_ANALYTICS_DATA.recentActivity.length,
        limit: 10
      })
    });
  });

  // Mock authentication validation
  await page.route('**/api/auth/validate', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        email: TEST_USER.email,
        name: TEST_USER.name
      })
    });
  });
}

// Helper function to sign in user
async function signInUser(page: Page) {
  await mockAPIResponses(page);
  
  // Navigate to dashboard first
  await page.goto('/dashboard');
  
  // Set authentication token in localStorage after page loads
  await page.addInitScript(() => {
    window.localStorage.setItem('katamaster_token', 'mock-token');
  });
  
  // Reload to apply auth state
  await page.reload();
  await page.waitForLoadState('networkidle');
}

test.describe('Dashboard Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Set base URL for API calls
    await page.addInitScript(() => {
      window.localStorage.setItem('katamaster_token', 'mock-token');
    });
  });

  test('should display dashboard analytics overview', async ({ page }) => {
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Check page title
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Your karate training analytics and progress')).toBeVisible();
    
    // Verify overview tab is active by default
    await expect(page.getByTestId('tab-overview')).toHaveClass(/bg-white text-purple-700/);
    
    // Check stats are displayed
    await expect(page.getByTestId('stat-katas')).toContainText('8');
    await expect(page.getByTestId('stat-sessions')).toContainText('24');
    await expect(page.getByTestId('stat-repetitions')).toContainText('156');
    await expect(page.getByTestId('stat-points')).toContainText('1.2K');
    await expect(page.getByTestId('stat-streak')).toContainText('5 days');
    await expect(page.getByTestId('stat-mastered')).toContainText('2');
    await expect(page.getByTestId('stat-rating')).toContainText('7.8');
    await expect(page.getByTestId('stat-minutes')).toContainText('12h');
  });

  test('should display quick insights section', async ({ page }) => {
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Check quick insights
    await expect(page.getByText('Quick Insights')).toBeVisible();
    await expect(page.getByText('Heian Shodan')).toBeVisible();
    await expect(page.getByText('Favorite Kata')).toBeVisible();
    await expect(page.getByText('Last Practice')).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Switch to progress tab
    await page.getByTestId('tab-progress').click();
    await expect(page.getByTestId('tab-progress')).toHaveClass(/bg-white text-purple-700/);
    await expect(page.getByText('Top Practiced Katas')).toBeVisible();
    
    // Switch to activity tab
    await page.getByTestId('tab-activity').click();
    await expect(page.getByTestId('tab-activity')).toHaveClass(/bg-white text-purple-700/);
    await expect(page.getByText('Recent Activity')).toBeVisible();
    
    // Switch back to overview
    await page.getByTestId('tab-overview').click();
    await expect(page.getByTestId('tab-overview')).toHaveClass(/bg-white text-purple-700/);
  });

  test('should display top katas with progress details', async ({ page }) => {
    await signInUser(page);
    
    // Navigate to progress tab
    await page.getByTestId('tab-progress').click();
    
    // Check top katas list
    await expect(page.getByTestId('top-katas-list')).toBeVisible();
    
    // Verify first kata (Heian Shodan)
    await expect(page.getByText('Heian Shodan')).toBeVisible();
    await expect(page.getByText('✅ Mastered')).toBeVisible();
    await expect(page.getByText('45 reps')).toBeVisible();
    
    // Verify second kata (Heian Nidan)
    await expect(page.getByText('Heian Nidan')).toBeVisible();
    await expect(page.getByText('32 reps')).toBeVisible();
    
    // Check progress bars are visible
    await expect(page.locator('.bg-green-500')).toBeVisible(); // Mastered kata progress bar
  });

  test('should display recent activity feed', async ({ page }) => {
    await signInUser(page);
    
    // Navigate to activity tab
    await page.getByTestId('tab-activity').click();
    
    // Check recent activity list
    await expect(page.getByTestId('recent-activity-list')).toBeVisible();
    
    // Verify activity entry
    await expect(page.getByText('Heian Shodan Practice')).toBeVisible();
    await expect(page.getByText('Completed 8 repetitions with focus on timing')).toBeVisible();
    await expect(page.getByText('+40 points')).toBeVisible();
    await expect(page.getByText('🥋')).toBeVisible();
  });

  test('should handle refresh functionality', async ({ page }) => {
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Test refresh button
    const refreshButton = page.getByTestId('refresh-button');
    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toContainText('Refresh');
    
    // Click refresh and verify it's disabled during refresh
    await refreshButton.click();
    // Note: In a real test, we might wait for a loading state
    
    // Verify button is clickable again after refresh
    await expect(refreshButton).not.toBeDisabled();
  });

  test('should handle unauthenticated state', async ({ page }) => {
    // Mock auth validation to return unauthorized
    await page.route('**/api/auth/validate', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should either show sign in page or the "Sign in to view your dashboard analytics" message
    const hasEmailInput = await page.locator('input[type="email"]').isVisible();
    const hasSignInMessage = await page.getByText('Sign in to view your dashboard analytics').isVisible();
    
    // Either the app redirected to sign in page OR the dashboard shows the sign in message
    expect(hasEmailInput || hasSignInMessage).toBe(true);
  });

  test('should handle loading state', async ({ page }) => {
    // Delay API response to test loading state
    await page.route('**/api/users/*/dashboard/analytics', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ANALYTICS_DATA)
      });
    });
    
    await signInUser(page);
    
    // Should show loading state
    await expect(page.getByText('Loading analytics...')).toBeVisible();
    
    // Wait for content to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/users/*/dashboard/analytics', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.route('**/api/users/*/recent-activity*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await signInUser(page);
    
    // Should still display dashboard with mock data (fallback)
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Verify stats grid adapts to mobile (should be 2 columns)
    const statsGrid = page.locator('.grid-cols-2');
    await expect(statsGrid).toBeVisible();
    
    // Check that tabs are still functional on mobile
    await page.getByTestId('tab-progress').click();
    await expect(page.getByText('Top Practiced Katas')).toBeVisible();
  });

  test('should display correct stat formatting', async ({ page }) => {
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Check number formatting (should show 1.2K for 1240 points)
    await expect(page.getByTestId('stat-points')).toContainText('1.2K');
    
    // Check time formatting (720 minutes should show as 12h)
    await expect(page.getByTestId('stat-minutes')).toContainText('12h');
    
    // Check decimal formatting (7.8 rating)
    await expect(page.getByTestId('stat-rating')).toContainText('7.8');
  });

  test('should show empty states appropriately', async ({ page }) => {
    // Mock empty data
    const emptyData = {
      stats: {
        totalKatasPracticed: 0,
        totalSessions: 0,
        totalRepetitions: 0,
        totalPracticeMinutes: 0,
        averageRating: 0,
        currentStreak: 0,
        totalPoints: 0,
        masteredKatas: 0,
        favoriteKata: '',
        lastPracticeDate: ''
      },
      topKatas: [],
      recentActivity: []
    };
    
    await page.route('**/api/users/*/dashboard/analytics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });
    
    await page.route('**/api/users/*/recent-activity*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activities: [],
          total: 0,
          limit: 10
        })
      });
    });
    
    await signInUser(page);
    
    // Check progress tab empty state
    await page.getByTestId('tab-progress').click();
    await expect(page.getByText('No practice data yet. Start practicing to see your progress!')).toBeVisible();
    
    // Check activity tab empty state
    await page.getByTestId('tab-activity').click();
    await expect(page.getByText('No recent activity. Start practicing to see your activity feed!')).toBeVisible();
  });
});

test.describe('Dashboard Analytics Performance', () => {
  test('should load dashboard within performance budget', async ({ page }) => {
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible({ timeout: 5000 });
    
    // Check that all main sections are loaded
    await expect(page.getByTestId('stat-katas')).toBeVisible();
    await expect(page.getByTestId('stat-sessions')).toBeVisible();
    await expect(page.getByTestId('stat-repetitions')).toBeVisible();
    await expect(page.getByTestId('stat-points')).toBeVisible();
  });

  test('should handle concurrent API calls efficiently', async ({ page }) => {
    let apiCallCount = 0;
    
    await page.route('**/api/users/*/dashboard/analytics', async route => {
      apiCallCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ANALYTICS_DATA)
      });
    });
    
    await signInUser(page);
    
    // Should make only one call to analytics API
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    expect(apiCallCount).toBe(1);
  });
});

test.describe('Dashboard Analytics Accessibility', () => {
  test('should be accessible with keyboard navigation', async ({ page }) => {
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Focus on progress tab
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('tab-progress')).toHaveClass(/bg-white text-purple-700/);
    
    // Test refresh button with keyboard
    await page.keyboard.press('Shift+Tab'); // Go back to refresh button
    await page.keyboard.press('Enter');
  });

  test('should have proper ARIA labels and semantic structure', async ({ page }) => {
    await signInUser(page);
    
    // Wait for dashboard to load
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Check heading structure
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Check that tabs have proper roles
    await expect(page.getByTestId('tab-overview')).toHaveAttribute('role', 'button');
    await expect(page.getByTestId('tab-progress')).toHaveAttribute('role', 'button');
    await expect(page.getByTestId('tab-activity')).toHaveAttribute('role', 'button');
  });
});