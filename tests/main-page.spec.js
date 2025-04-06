const { test, expect } = require('@playwright/test');

test.describe('Main Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page successfully', async ({ page }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle('Cognitive Distortion Matcher');
    
    // Check if main elements are present
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('.container')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Test navigation to different pages
    const links = ['despre.html', 'tech-stack.html'];
    
    for (const link of links) {
      const linkElement = page.locator(`a[href="${link}"]`);
      await expect(linkElement).toBeVisible();
      await linkElement.click();
      await expect(page).toHaveURL(new RegExp(link));
      await page.goBack();
    }
  });

  test('should handle login and game screen transition', async ({ page }) => {
    // Initial state check
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#game-screen')).toHaveClass('screen hidden');

    // Fill in login form
    await page.fill('#username', 'test1');
    await page.fill('#password', 'pass1');
    
    // Submit login form and wait for navigation
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/login') && response.status() === 200),
      page.click('#login-btn')
    ]);

    // Wait for game screen to be visible
    await page.waitForSelector('#game-screen:not(.hidden)');
    await expect(page.locator('#login-screen')).not.toBeVisible();
    await expect(page.locator('.memory-game')).toBeVisible();
  });
}); 