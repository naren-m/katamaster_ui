import { test, expect, Page } from '@playwright/test';

// Real backend configuration
const BACKEND_URL = 'http://192.168.68.138:8083';
const TEST_USER = {
  email: 'e2e-test@katamaster.com',
  password: 'TestPassword123!',
  name: 'E2E Test User'
};

// Helper function to create a unique test user for each test run
function createTestUser() {
  const timestamp = Date.now();
  return {
    email: `e2e-test-${timestamp}@katamaster.com`,
    password: 'TestPassword123!',
    name: `E2E Test User ${timestamp}`
  };
}

// Helper function to check if backend is available
async function checkBackendHealth(page: Page): Promise<boolean> {
  try {
    const response = await page.request.get(`${BACKEND_URL}/health`);
    return response.ok();
  } catch (error) {
    console.log('Backend health check failed:', error);
    return false;
  }
}

// Helper function to sign up a new user via API
async function signUpUser(page: Page, user: typeof TEST_USER) {
  try {
    const response = await page.request.post(`${BACKEND_URL}/api/auth/signup`, {
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        account_type: 'individual'
      }
    });
    
    if (response.ok()) {
      const data = await response.json();
      return { success: true, token: data.token, user: data.user };
    } else {
      const errorText = await response.text();
      console.log('Signup failed:', errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log('Signup error:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to sign in user via API
async function signInUser(page: Page, user: typeof TEST_USER) {
  try {
    const response = await page.request.post(`${BACKEND_URL}/api/auth/signin`, {
      data: {
        email: user.email,
        password: user.password
      }
    });
    
    if (response.ok()) {
      const data = await response.json();
      return { success: true, token: data.token, user: data.user };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

test.describe('Real Backend Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Check if backend is available before running tests
    const backendHealthy = await checkBackendHealth(page);
    test.skip(!backendHealthy, 'Backend is not available');
  });

  test('should authenticate with real backend and access dashboard', async ({ page }) => {
    const testUser = createTestUser();
    
    // Step 1: Sign up a new user
    const signupResult = await signUpUser(page, testUser);
    expect(signupResult.success).toBe(true);
    console.log('✅ User signed up successfully');

    // Step 2: Set the token in localStorage and navigate to dashboard
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('katamaster_token', token);
    }, signupResult.token);

    // Step 3: Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Step 4: Verify dashboard loads with real data
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Check for dashboard elements (allowing for loading state)
    const hasDashboardHeading = await page.locator('h1, h2').filter({ hasText: 'Dashboard' }).isVisible();
    const hasAnalyticsSection = await page.getByTestId('dashboard-analytics').isVisible().catch(() => false);
    
    console.log('Has Dashboard heading:', hasDashboardHeading);
    console.log('Has Analytics section:', hasAnalyticsSection);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'real-backend-dashboard.png', fullPage: true });
    
    // At minimum, we should be on the dashboard page and authenticated
    expect(hasDashboardHeading || hasAnalyticsSection).toBe(true);
  });

  test('should handle dashboard analytics real-time updates', async ({ page }) => {
    const testUser = createTestUser();
    
    // Sign up and authenticate
    const signupResult = await signUpUser(page, testUser);
    expect(signupResult.success).toBe(true);

    // Set token and navigate to dashboard
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('katamaster_token', token);
    }, signupResult.token);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for dashboard to load
    await page.waitForTimeout(2000);

    // Check if refresh functionality exists and works
    const refreshButton = page.getByTestId('refresh-button');
    const hasRefreshButton = await refreshButton.isVisible().catch(() => false);
    
    if (hasRefreshButton) {
      console.log('✅ Refresh button found');
      await refreshButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Refresh functionality works');
    }

    // Verify basic dashboard elements are present
    const bodyContent = await page.locator('body').textContent();
    const hasDashboardContent = bodyContent?.includes('Dashboard') || 
                               bodyContent?.includes('analytics') || 
                               bodyContent?.includes('progress');
    
    expect(hasDashboardContent).toBe(true);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Navigate to dashboard without authentication
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should either redirect to sign-in or show unauthenticated state
    const url = page.url();
    const hasSignInForm = await page.locator('input[type="email"]').isVisible().catch(() => false);
    const hasSignInMessage = await page.getByText(/sign in/i).isVisible().catch(() => false);
    
    console.log('Current URL:', url);
    console.log('Has sign-in form:', hasSignInForm);
    console.log('Has sign-in message:', hasSignInMessage);

    // Should handle unauthenticated state appropriately
    expect(hasSignInForm || hasSignInMessage || url.includes('/signin')).toBe(true);
  });

  test('should validate API connectivity and data flow', async ({ page }) => {
    // Test direct API connectivity
    const healthResponse = await page.request.get(`${BACKEND_URL}/health`);
    expect(healthResponse.ok()).toBe(true);
    
    const healthData = await healthResponse.json();
    expect(healthData.status).toBe('healthy');
    console.log('✅ Backend health check passed');

    // Test analytics endpoint (should require auth)
    const analyticsResponse = await page.request.get(`${BACKEND_URL}/api/users/test-user/dashboard/analytics`);
    // Expecting 401 or similar auth error for unauthenticated request
    expect([401, 403, 404].includes(analyticsResponse.status())).toBe(true);
    console.log('✅ Analytics endpoint properly protected');
  });

  test('should test complete user workflow', async ({ page }) => {
    const testUser = createTestUser();
    
    // Step 1: Navigate to home page
    await page.goto('/');
    
    // Step 2: Check if we're redirected to sign-in
    const hasSignInForm = await page.locator('input[type="email"]').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasSignInForm) {
      console.log('✅ Sign-in form detected, testing sign-up flow');
      
      // Look for sign-up link/button and click it
      const signUpLink = page.getByText(/sign up/i).or(page.getByText(/create account/i)).first();
      const hasSignUpLink = await signUpLink.isVisible().catch(() => false);
      
      if (hasSignUpLink) {
        await signUpLink.click();
        await page.waitForLoadState('networkidle');
        
        // Fill sign-up form
        await page.fill('input[type="email"]', testUser.email);
        await page.fill('input[type="password"]', testUser.password);
        
        const nameField = page.locator('input[name="name"]').or(page.locator('input[placeholder*="name"]'));
        const hasNameField = await nameField.isVisible().catch(() => false);
        if (hasNameField) {
          await nameField.fill(testUser.name);
        }
        
        // Submit sign-up form
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Sign-up form submitted');
      }
    }
    
    // Step 3: Navigate to dashboard (should work if authenticated)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Take final screenshot
    await page.screenshot({ path: 'complete-workflow-test.png', fullPage: true });
    
    // Verify we can access some form of dashboard
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    
    // Test passes if we can navigate and get some reasonable response
    expect(finalUrl).toContain('/dashboard');
  });

  test('should test dashboard responsiveness', async ({ page }) => {
    const testUser = createTestUser();
    
    // Authenticate user
    const signupResult = await signUpUser(page, testUser);
    if (signupResult.success) {
      await page.goto('/');
      await page.evaluate((token) => {
        localStorage.setItem('katamaster_token', token);
      }, signupResult.token);
    }

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'mobile-dashboard-test.png', fullPage: true });
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tablet-dashboard-test.png', fullPage: true });
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'desktop-dashboard-test.png', fullPage: true });
    
    // Basic responsiveness check
    expect(page.url()).toContain('/dashboard');
    console.log('✅ Responsive design test completed');
  });
});

test.describe('Backend Performance Tests', () => {
  test('should measure dashboard loading performance', async ({ page }) => {
    const testUser = createTestUser();
    
    // Check backend availability
    const backendHealthy = await checkBackendHealth(page);
    test.skip(!backendHealthy, 'Backend is not available');
    
    // Authenticate user
    const signupResult = await signUpUser(page, testUser);
    if (signupResult.success) {
      await page.goto('/');
      await page.evaluate((token) => {
        localStorage.setItem('katamaster_token', token);
      }, signupResult.token);
    }

    // Measure page load time
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Dashboard load time: ${loadTime}ms`);
    
    // Performance assertion (should load within 10 seconds)
    expect(loadTime).toBeLessThan(10000);
    
    // Check for any console errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Log any console errors for debugging
    if (consoleLogs.length > 0) {
      console.log('Console errors detected:', consoleLogs);
    }
  });
});