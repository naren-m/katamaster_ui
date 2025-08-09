import { test, expect } from '@playwright/test';

test('debug API data directly', async ({ page }) => {
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
  
  // Inject script to test API directly from the browser context
  const apiData = await page.evaluate(async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('katamaster_token');
      const userId = 'b75bac38-adb3-41dc-950f-33e141b37183'; // Demo user ID
      
      console.log('Token exists:', !!token);
      
      // Call practice history API directly
      const response = await fetch(`http://192.168.68.138:8083/api/users/${userId}/practice/history?page=1&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response total sessions:', data.total_sessions);
      console.log('API Response sessions returned:', data.practice_history?.length);
      
      // Count sessions with data
      const sessionsWithKatas = data.practice_history?.filter(s => s.katas && s.katas.length > 0) || [];
      const sessionsWithTechniques = data.practice_history?.filter(s => s.techniques && s.techniques.length > 0) || [];
      
      console.log('Sessions with katas:', sessionsWithKatas.length);
      console.log('Sessions with techniques:', sessionsWithTechniques.length);
      
      if (sessionsWithKatas.length > 0) {
        console.log('Sample kata session:', JSON.stringify(sessionsWithKatas[0]));
      }
      if (sessionsWithTechniques.length > 0) {
        console.log('Sample technique session:', JSON.stringify(sessionsWithTechniques[0]));
      }
      
      return {
        totalSessions: data.total_sessions,
        sessionsReturned: data.practice_history?.length,
        sessionsWithKatas: sessionsWithKatas.length,
        sessionsWithTechniques: sessionsWithTechniques.length,
        sampleKataSession: sessionsWithKatas[0] || null,
        sampleTechniqueSession: sessionsWithTechniques[0] || null
      };
    } catch (error) {
      console.error('API test failed:', error);
      return { error: error.message };
    }
  });
  
  console.log('API Data Summary:', apiData);
  
  // Take screenshot
  await page.screenshot({ path: 'debug-api-direct.png', fullPage: true });
});