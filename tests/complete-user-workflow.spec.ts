import { test, expect, Page } from '@playwright/test';

// Test data constants
const TEST_USER = {
  email: 'e2e-test@example.com',
  password: 'testpassword123',
  name: 'E2E Test User'
};

const MOCK_KATA_DATA = {
  katas: [
    {
      id: '1',
      name: 'Heian Shodan',
      style: 'Shotokan',
      difficulty: 'beginner',
      beltLevel: '9th Kyu',
      description: 'First kata in the Heian series',
      movements: 21,
      meaning: 'Peaceful Mind First',
      keyTechniques: ['Gedan Barai', 'Oi-zuki', 'Age-uke'],
      practiceTime: '3-5 minutes',
      origin: 'Okinawan Pinan Shodan'
    }
  ]
};

// Helper functions for mocking API responses
async function mockAuthenticationAPIs(page: Page) {
  // Mock sign in
  await page.route('**/api/auth/signin', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token',
        user: {
          id: 'test-user-id',
          email: TEST_USER.email,
          name: TEST_USER.name
        }
      })
    });
  });

  // Mock session validation
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

async function mockKataAPIs(page: Page) {
  // Mock kata list
  await page.route('**/api/katas', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_KATA_DATA)
    });
  });

  // Mock kata progress - initially empty
  await page.route('**/api/kata/progress*', async route => {
    const url = route.request().url();
    if (url.includes('kata_id=1')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          progress: {
            kataId: '1',
            userId: 'test-user-id',
            totalPracticeSessions: 0,
            totalPracticeMinutes: 0,
            totalRepetitions: 0,
            averageRating: 0.0,
            lastPracticed: '',
            mastered: false,
            masteryPercentage: 0,
            nextGoal: 'Start practicing this kata'
          }
        })
      });
    } else {
      await route.fulfill({ status: 404 });
    }
  });

  // Mock practice recording
  await page.route('**/api/kata/practice', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            id: 'session-1',
            kataId: '1',
            userId: 'test-user-id',
            date: new Date().toISOString(),
            repetitions: 5,
            notes: 'Great practice session (Earned 25 points)',
            durationMinutes: 30
          }
        })
      });
    }
  });
}

async function mockDashboardAPIs(page: Page) {
  // Mock dashboard analytics
  await page.route('**/api/users/*/dashboard/analytics', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stats: {
          totalKatasPracticed: 1,
          totalSessions: 1,
          totalRepetitions: 5,
          totalPracticeMinutes: 30,
          averageRating: 8.0,
          currentStreak: 1,
          totalPoints: 25,
          masteredKatas: 0,
          favoriteKata: 'Heian Shodan',
          lastPracticeDate: new Date().toISOString()
        },
        topKatas: [
          {
            kataId: '1',
            kataName: 'Heian Shodan',
            totalRepetitions: 5,
            masteryPercentage: 20,
            mastered: false,
            lastPracticed: new Date().toISOString()
          }
        ],
        progressTrend: [
          { date: '2024-01-24', sessions: 1, repetitions: 5 }
        ]
      })
    });
  });

  // Mock recent activity
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
}

async function setupMockAPIs(page: Page) {
  await mockAuthenticationAPIs(page);
  await mockKataAPIs(page);
  await mockDashboardAPIs(page);
}

async function signInUser(page: Page) {
  await page.goto('/');
  
  // Check if we're on sign in page or need to sign in
  const isSignInPage = await page.locator('input[type="email"]').isVisible();
  
  if (isSignInPage) {
    // Fill in sign in form
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
  }
  
  // Wait for main app to load (should redirect to home page)
  await page.waitForLoadState('networkidle');
}

test.describe('Complete User Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAPIs(page);
  });

  test('should complete full user journey: sign in → browse katas → practice → view progress → dashboard', async ({ page }) => {
    // Step 1: Sign in
    await signInUser(page);
    
    // Verify successful sign in (should be on home page)
    await expect(page).toHaveURL('/');
    
    // Step 2: Navigate to kata reference page
    await page.goto('/kata');
    
    // Wait for kata reference page to load
    await expect(page.getByText('Kata Reference')).toBeVisible();
    await expect(page.getByText('Heian Shodan')).toBeVisible();
    
    // Step 3: View kata details and initial progress
    const kataCard = page.locator('[data-testid*="kata-card"]').first();
    await expect(kataCard).toBeVisible();
    
    // Check that progress component shows initial state
    await expect(page.getByText('Sign in to track your kata progress')).not.toBeVisible();
    await expect(page.getByText('Loading progress...')).toBeVisible({ timeout: 2000 });
    
    // Step 4: Record a practice session
    await expect(page.getByText('📝 Record Practice')).toBeVisible();
    await page.click('button:has-text("📝 Record Practice")');
    
    // Fill out practice form
    await expect(page.getByText('Record Practice Session')).toBeVisible();
    await page.fill('input[type="number"]:first', '5'); // repetitions
    await page.fill('input[type="number"]:nth(1)', '30'); // duration
    await page.fill('input[type="number"]:nth(2)', '8.0'); // rating
    await page.fill('textarea', 'Great practice session focused on form and timing');
    
    // Submit practice session
    await page.click('button:has-text("Record Session")');
    
    // Wait for success and progress update
    await expect(page.getByText('Recording...')).toBeVisible();
    await expect(page.getByText('Record Session')).toBeVisible(); // Form should be hidden after success
    
    // Step 5: Verify updated progress shows
    await page.waitForTimeout(1000); // Allow time for progress to update
    
    // Should now show progress data
    await expect(page.getByText('Progress Summary')).toBeVisible();
    
    // Step 6: Navigate to dashboard
    await page.goto('/dashboard');
    
    // Verify dashboard loads
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Step 7: Verify dashboard shows updated stats
    await expect(page.getByTestId('stat-katas')).toContainText('1'); // 1 kata practiced
    await expect(page.getByTestId('stat-sessions')).toContainText('1'); // 1 session
    await expect(page.getByTestId('stat-repetitions')).toContainText('5'); // 5 repetitions
    await expect(page.getByTestId('stat-points')).toContainText('25'); // 25 points
    
    // Step 8: Check progress tab
    await page.getByTestId('tab-progress').click();
    await expect(page.getByText('Top Practiced Katas')).toBeVisible();
    await expect(page.getByText('Heian Shodan')).toBeVisible();
    
    // Step 9: Check activity tab
    await page.getByTestId('tab-activity').click();
    await expect(page.getByText('Recent Activity')).toBeVisible();
    await expect(page.getByText('Heian Shodan Practice')).toBeVisible();
    await expect(page.getByText('Completed 5 repetitions')).toBeVisible();
    await expect(page.getByText('+25 points')).toBeVisible();
  });

  test('should handle multiple practice sessions and show cumulative progress', async ({ page }) => {
    // Update mock to show cumulative progress
    await page.route('**/api/kata/progress*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          progress: {
            kataId: '1',
            userId: 'test-user-id',
            totalPracticeSessions: 2,
            totalPracticeMinutes: 60,
            totalRepetitions: 15,
            averageRating: 8.5,
            lastPracticed: new Date().toISOString(),
            mastered: false,
            masteryPercentage: 60,
            nextGoal: 'Focus on stance and timing - work toward Yellow belt level'
          }
        })
      });
    });

    await signInUser(page);
    await page.goto('/kata');
    
    // Record first practice session
    await page.click('button:has-text("📝 Record Practice")');
    await page.fill('input[type="number"]:first', '8');
    await page.fill('input[type="number"]:nth(1)', '30');
    await page.click('button:has-text("Record Session")');
    
    await page.waitForTimeout(1000);
    
    // Record second practice session
    await page.click('button:has-text("📝 Record Practice")');
    await page.fill('input[type="number"]:first', '7');
    await page.fill('input[type="number"]:nth(1)', '30');
    await page.click('button:has-text("Record Session")');
    
    // Verify cumulative progress
    await expect(page.getByText('2')).toBeVisible(); // sessions count
    await expect(page.getByText('15')).toBeVisible(); // total repetitions
    await expect(page.getByText('60%')).toBeVisible(); // mastery percentage
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await signInUser(page);
    
    // Navigate to kata page
    await page.goto('/kata');
    await expect(page.getByText('Kata Reference')).toBeVisible();
    
    // Test mobile-specific interactions
    await expect(page.getByText('Heian Shodan')).toBeVisible();
    
    // Record practice session on mobile
    await page.click('button:has-text("📝 Record Practice")');
    await expect(page.getByText('Record Practice Session')).toBeVisible();
    
    // Fill form (should work on mobile)
    await page.fill('input[type="number"]:first', '3');
    await page.click('button:has-text("Record Session")');
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    // Test tab switching on mobile
    await page.getByTestId('tab-progress').click();
    await expect(page.getByText('Top Practiced Katas')).toBeVisible();
  });

  test('should handle PDF viewing workflow', async ({ page }) => {
    await signInUser(page);
    await page.goto('/kata');
    
    // Mock PDF serving
    await page.route('**/katas/*.pdf', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: 'Mock PDF content'
      });
    });
    
    // Click to view PDF
    await page.click('button:has-text("📄 View Instructions PDF")');
    
    // Should open PDF viewer
    await expect(page.getByText('Heian Shodan')).toBeVisible(); // PDF viewer title
    
    // Close PDF viewer (if implemented)
    await page.keyboard.press('Escape');
  });

  test('should persist data across page refreshes', async ({ page }) => {
    await signInUser(page);
    await page.goto('/kata');
    
    // Record practice session
    await page.click('button:has-text("📝 Record Practice")');
    await page.fill('input[type="number"]:first', '5');
    await page.click('button:has-text("Record Session")');
    
    // Refresh page
    await page.reload();
    
    // Should still show progress data
    await expect(page.getByText('Progress Summary')).toBeVisible();
    
    // Navigate to dashboard and refresh
    await page.goto('/dashboard');
    await page.reload();
    
    // Dashboard should still work
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await signInUser(page);
    
    // Mock network error for practice recording
    await page.route('**/api/kata/practice', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/kata');
    
    // Try to record practice session
    await page.click('button:has-text("📝 Record Practice")');
    await page.fill('input[type="number"]:first', '5');
    await page.click('button:has-text("Record Session")');
    
    // Should show error handling
    await expect(page.getByText('Failed to record practice session')).toBeVisible();
  });

  test('should provide good user experience for first-time users', async ({ page }) => {
    // Mock empty state for new user
    await page.route('**/api/kata/progress*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          progress: {
            kataId: '1',
            userId: 'test-user-id',
            totalPracticeSessions: 0,
            totalPracticeMinutes: 0,
            totalRepetitions: 0,
            averageRating: 0.0,
            lastPracticed: '',
            mastered: false,
            masteryPercentage: 0,
            nextGoal: 'Start practicing this kata'
          }
        })
      });
    });
    
    await page.route('**/api/users/*/dashboard/analytics', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
          progressTrend: []
        })
      });
    });
    
    await signInUser(page);
    
    // Check dashboard shows appropriate empty state
    await page.goto('/dashboard');
    await expect(page.getByTestId('stat-katas')).toContainText('0');
    
    // Check kata page shows helpful onboarding
    await page.goto('/kata');
    await expect(page.getByText('Start practicing this kata')).toBeVisible();
    
    // Should encourage first practice session
    await expect(page.getByText('📝 Record Practice')).toBeVisible();
  });
});

test.describe('User Workflow Performance', () => {
  test('should complete workflow within performance budgets', async ({ page }) => {
    await setupMockAPIs(page);
    
    const startTime = Date.now();
    
    // Complete basic workflow
    await signInUser(page);
    await page.goto('/kata');
    await expect(page.getByText('Heian Shodan')).toBeVisible();
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within 10 seconds (generous for E2E)
    expect(totalTime).toBeLessThan(10000);
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    await setupMockAPIs(page);
    await signInUser(page);
    
    // Open multiple tabs/operations
    await Promise.all([
      page.goto('/kata'),
      page.goto('/dashboard')
    ]);
    
    // Both should load successfully
    await expect(page.getByTestId('dashboard-analytics')).toBeVisible();
  });
});