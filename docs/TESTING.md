# Testing & Quality Assurance Guide

This document outlines the comprehensive testing strategy for the Vishwa Lifestyle e-commerce platform.

## 📋 Table of Contents

1. [Testing Pyramid](#testing-pyramid)
2. [Local Development Testing](#local-development-testing)
3. [Automated Testing (CI/CD)](#automated-testing-cicd)
4. [Test Types](#test-types)
5. [Running Tests](#running-tests)
6. [Writing Tests](#writing-tests)
7. [Troubleshooting](#troubleshooting)

---

## 🔺 Testing Pyramid

Our testing strategy follows the testing pyramid approach:

```
        /\
       /  \      E2E Tests (Few)
      /____\     - Critical user flows
     /      \    - Cross-browser testing
    /        \   
   /__________\  Integration Tests (Some)
  /            \ - API integration
 /              \- Component integration
/________________\ Unit Tests (Many)
                  - Business logic
                  - Utility functions
```

---

## 💻 Local Development Testing

### Before Every Commit

Run these commands to ensure code quality:

```bash
# 1. Type checking
npm run type-check

# 2. Linting
npm run lint

# 3. Format checking
npm run format:check

# 4. Run unit tests
npm test

# 5. Build test (optional but recommended)
npm run build
```

### Pre-commit Hooks (Automatic)

We use **Husky** to automatically run checks before commits:

- ✅ Automatic code formatting (Prettier)
- ✅ ESLint fixes
- ✅ TypeScript type checking

If any check fails, the commit will be blocked.

---

## 🤖 Automated Testing (CI/CD)

### GitHub Actions Workflows

We have two main workflows:

#### 1. **CI Pipeline** (`.github/workflows/ci.yml`)

Runs on every push and pull request:

- **Code Quality**: ESLint, Prettier, TypeScript
- **Build Test**: Ensures production build succeeds
- **Unit Tests**: Jest tests with coverage
- **E2E Tests**: Playwright tests (on PRs only)
- **Security Audit**: npm audit for vulnerabilities
- **Performance**: Lighthouse CI (on PRs only)

#### 2. **Deploy Preview** (`.github/workflows/deploy-preview.yml`)

Runs on pull requests:

- Deploys preview to Vercel
- Comments on PR with preview URL
- Allows testing changes before merging

### Setting Up GitHub Secrets

Add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

Required secrets:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=https://www.vishwalifestyle.com
VERCEL_TOKEN=your_vercel_token
CODECOV_TOKEN=your_codecov_token (optional)
```

---

## 🧪 Test Types

### 1. Unit Tests (Jest)

**Location**: `tests/unit/`

**Purpose**: Test individual functions and components in isolation

**Example**:
```typescript
// tests/unit/utils.test.ts
import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(1000)).toBe('₹1,000');
  });
});
```

### 2. Integration Tests (Jest)

**Location**: `tests/integration/`

**Purpose**: Test how different parts work together (e.g., Sanity queries)

**Example**: See `tests/integration/shop.test.ts`

### 3. E2E Tests (Playwright)

**Location**: `tests/e2e/`

**Purpose**: Test complete user flows in real browsers

**Example**: See `tests/e2e/shop-flow.spec.ts`

---

## 🚀 Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run in watch mode (for development)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- shop.test.ts
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test shop-flow.spec.ts
```

### Type Checking

```bash
# Check for TypeScript errors
npm run type-check
```

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Build Testing

```bash
# Test production build
npm run build

# Run production build locally
npm run build && npm start
```

---

## ✍️ Writing Tests

### Test Naming Convention

```typescript
describe('ComponentName or Feature', () => {
  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### Integration Test Example

```typescript
// tests/integration/sanity-queries.test.ts
import { getFilteredProducts } from '@/lib/sanity';

describe('Sanity Queries', () => {
  it('should filter products by category and subcategory', async () => {
    const result = await getFilteredProducts({
      category: 'aromas',
      sub: 'Incense',
    });

    expect(result.products).toBeInstanceOf(Array);
    result.products.forEach((product) => {
      expect(product.category).toBe('aromas');
      expect(product.subCategory).toBe('Incense');
    });
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('complete checkout flow', async ({ page }) => {
  await page.goto('/shop');
  
  // Add product to cart
  await page.click('[data-testid="product-card"]');
  await page.click('[data-testid="add-to-cart"]');
  
  // Go to checkout
  await page.click('[data-testid="cart-icon"]');
  await page.click('[data-testid="checkout-button"]');
  
  // Verify on checkout page
  await expect(page).toHaveURL(/\/checkout/);
});
```

---

## 🔍 What to Test

### Critical Paths (Must Test)

1. **Shop Filtering**
   - Category filtering
   - Subcategory filtering
   - Segment filtering
   - Search functionality
   - Price range filtering
   - Sorting

2. **Product Pages**
   - Product detail loading
   - Image gallery
   - Add to cart
   - Variant selection

3. **Cart & Checkout**
   - Add/remove items
   - Update quantities
   - Checkout flow
   - Payment integration

4. **Authentication**
   - Login/logout
   - Registration
   - Password reset
   - Protected routes

5. **Admin Panel**
   - Order management
   - Product management
   - User management

### Edge Cases to Test

- Empty states (no products, no search results)
- Error states (network errors, API failures)
- Loading states
- Invalid inputs
- Mobile responsiveness
- Cross-browser compatibility

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Tests Fail Locally But Pass in CI**

**Cause**: Environment differences

**Solution**:
```bash
# Use same Node version as CI
nvm use 20

# Clear cache
npm run clean
npm ci
```

#### 2. **E2E Tests Timeout**

**Cause**: Slow network or heavy page

**Solution**:
```typescript
// Increase timeout in test
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

#### 3. **Snapshot Tests Fail**

**Cause**: UI changes

**Solution**:
```bash
# Update snapshots
npm test -- -u
```

#### 4. **Type Errors in Tests**

**Cause**: Missing type definitions

**Solution**:
```bash
npm install --save-dev @types/jest @types/node
```

---

## 📊 Coverage Reports

After running `npm run test:coverage`, open:

```
coverage/lcov-report/index.html
```

**Coverage Goals**:
- Statements: > 50%
- Branches: > 50%
- Functions: > 50%
- Lines: > 50%

---

## 🎯 Best Practices

1. **Write tests for bugs**: When you fix a bug, write a test to prevent regression
2. **Test user behavior**: Focus on what users do, not implementation details
3. **Keep tests independent**: Each test should run in isolation
4. **Use meaningful assertions**: Be specific about what you're testing
5. **Mock external dependencies**: Don't rely on external APIs in unit tests
6. **Test edge cases**: Empty arrays, null values, error conditions
7. **Keep tests fast**: Unit tests should run in milliseconds

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

## 🚨 When Tests Fail in CI

1. **Check the GitHub Actions logs** for detailed error messages
2. **Run the same test locally** to reproduce
3. **Check if it's an environment issue** (secrets, env variables)
4. **Review recent changes** that might have broken the test
5. **Don't merge PRs with failing tests** unless it's a known flaky test

---

## 📝 Adding New Tests

When adding new features:

1. Write unit tests for business logic
2. Write integration tests for API interactions
3. Write E2E tests for critical user flows
4. Update this documentation if needed

**Remember**: Good tests are an investment that pays off by catching bugs early! 🎉
