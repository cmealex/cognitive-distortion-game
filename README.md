# Catch All Cognitive Distortions - UI Tests

This project includes automated UI tests using Playwright to ensure the quality and functionality of the application.

## Setup

1. Install Node.js if you haven't already
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

- Run all tests in headless mode:
  ```bash
  npm test
  ```

- Run tests in headed mode (visible browser):
  ```bash
  npm run test:headed
  ```

- Run tests in debug mode:
  ```bash
  npm run test:debug
  ```

## Test Structure

- `tests/main-page.spec.js`: Tests for the main page layout and navigation
- `tests/game-functionality.spec.js`: Tests for the game mechanics and interactions

## Test Reports

After running the tests, you can find the HTML report in the `playwright-report` directory. Open `index.html` in your browser to view detailed test results.

## Continuous Integration

The tests are configured to run in CI environments with appropriate retries and parallelization settings. 