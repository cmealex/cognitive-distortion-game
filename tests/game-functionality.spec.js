const { test, expect } = require('@playwright/test');

test.describe('Game Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login
    await page.fill('#username', 'test1');
    await page.fill('#password', 'pass1');
    
    // Submit login form and wait for navigation
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/login') && response.status() === 200),
      page.click('#login-btn')
    ]);

    // Wait for game screen to be visible
    await page.waitForSelector('#game-screen:not(.hidden)');
    await expect(page.locator('.memory-game')).toBeVisible();
  });

  test('should handle card interactions correctly', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForSelector('.memory-game .card');
    
    // Test card click
    const firstCard = page.locator('.memory-game .card').first();
    await firstCard.click();
    
    // Wait for and check if card state changes
    await expect(firstCard).toHaveClass(/flipped/);
  });

  test('should update game state correctly', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForSelector('.memory-game .card');
    
    // Get initial state
    const initialState = await page.locator('.memory-game').getAttribute('data-state');
    
    // Make a move and wait for state update
    const firstCard = page.locator('.memory-game .card').first();
    await firstCard.click();
    
    // Wait for and check if state updated
    await page.waitForTimeout(500); // Wait for state update
    const newState = await page.locator('.memory-game').getAttribute('data-state');
    expect(newState).not.toBe(initialState);
  });

  test('should handle game completion', async ({ page }) => {
    // Wait for game to initialize
    await page.waitForSelector('.memory-game .card');
    
    // Simulate completing the game
    const cards = await page.locator('.memory-game .card').all();
    for (const card of cards) {
      await card.click();
      // Wait for animations and state updates
      await page.waitForTimeout(500);
    }
    
    // Wait for and check completion message
    await page.waitForSelector('#game-complete:visible');
    await expect(page.locator('#game-complete')).toBeVisible();
  });
}); 