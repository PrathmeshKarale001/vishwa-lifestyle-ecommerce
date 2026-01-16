# 🚀 Complete Testing & CI/CD Setup Guide

## Overview

This guide will help you set up a complete testing and continuous integration/deployment pipeline for your Vishwa Lifestyle e-commerce website. This setup will catch issues like the GROQ query error **before** they reach production.

---

## 📦 What's Included

✅ **Local Pre-commit Hooks** - Automatic checks before every commit  
✅ **GitHub Actions CI/CD** - Automated testing on every push/PR  
✅ **Unit Tests** - Test individual functions and components  
✅ **Integration Tests** - Test Sanity queries and API integrations  
✅ **E2E Tests** - Test complete user flows in real browsers  
✅ **Security Audits** - Automatic vulnerability scanning  
✅ **Performance Monitoring** - Lighthouse CI for performance tracking  
✅ **Preview Deployments** - Automatic preview URLs for PRs  

---

## 🎯 Quick Start

### Step 1: Install Playwright Browsers

```bash
npx playwright install
```

### Step 2: Set Up Husky (Pre-commit Hooks)

```bash
npm run prepare
```

### Step 3: Run All Validations

```bash
npm run validate
```

This will run:
- TypeScript type checking
- ESLint
- Prettier format checking
- Production build test

---

## 🔧 GitHub Actions Setup

### 1. Add GitHub Secrets

Go to your repository on GitHub:

```
Settings → Secrets and variables → Actions → New repository secret
```

Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID | `abc123xyz` |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_URL` | Your production URL | `https://www.vishwalifestyle.com` |
| `VERCEL_TOKEN` | Vercel deployment token | Get from Vercel dashboard |
| `CODECOV_TOKEN` | (Optional) Code coverage tracking | Get from codecov.io |

### 2. How to Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Copy the token and add it to GitHub secrets

### 3. Workflows Explained

#### **CI Pipeline** (`.github/workflows/ci.yml`)

Runs on: Every push and pull request

Jobs:
1. **Code Quality** - Linting, formatting, type checking
2. **Build Test** - Ensures production build works
3. **Unit Tests** - Runs Jest tests
4. **E2E Tests** - Runs Playwright tests (PRs only)
5. **Security Audit** - Checks for vulnerabilities
6. **Lighthouse** - Performance testing (PRs only)

#### **Deploy Preview** (`.github/workflows/deploy-preview.yml`)

Runs on: Pull requests

- Deploys to Vercel preview environment
- Comments on PR with preview URL
- Allows testing before merging

---

## 🧪 Testing Locally

### Before Every Commit

The pre-commit hook will automatically run:

```bash
# These run automatically when you commit
✓ ESLint auto-fix
✓ Prettier auto-format
✓ TypeScript type check
```

If any check fails, the commit will be blocked.

### Manual Testing Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix  # Auto-fix issues

# Formatting
npm run format:check
npm run format  # Auto-format files

# Unit & Integration Tests
npm test
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage report

# E2E Tests
npm run test:e2e
npm run test:e2e:ui  # Interactive UI mode
npm run test:e2e:debug  # Debug mode

# Full Validation (runs everything)
npm run validate
```

---

## 📝 Writing Tests

### Example: Integration Test for Shop Filtering

```typescript
// tests/integration/shop.test.ts
import { getFilteredProducts } from '@/lib/sanity';

describe('Shop Filtering', () => {
  it('should filter by category, subcategory, and segment', async () => {
    const result = await getFilteredProducts({
      category: 'aromas',
      sub: 'Incense',
      segment: 'Chakra',
    });

    expect(result.products).toBeInstanceOf(Array);
    result.products.forEach((product) => {
      expect(product.category).toBe('aromas');
      expect(product.subCategory).toBe('Incense');
      expect(product.segments).toContain('Chakra');
    });
  });
});
```

### Example: E2E Test for User Flow

```typescript
// tests/e2e/shop-flow.spec.ts
import { test, expect } from '@playwright/test';

test('filter products by category and subcategory', async ({ page }) => {
  await page.goto('/shop');
  
  // Click category
  await page.click('text=Aromas');
  await expect(page).toHaveURL(/category=aromas/);
  
  // Click subcategory
  await page.click('text=Incense');
  await expect(page).toHaveURL(/sub=Incense/);
  
  // Verify products loaded
  const products = page.locator('[data-testid="product-card"]');
  await expect(products.first()).toBeVisible();
});
```

---

## 🐛 How This Prevents Issues

### The GROQ Query Error (Example)

**What happened:**
- GROQ query used `match` operator on array field
- Caused runtime error in production
- Users saw error page

**How testing prevents this:**

1. **TypeScript Type Check** ❌ Wouldn't catch (valid syntax)
2. **Integration Tests** ✅ **WOULD CATCH**
   ```typescript
   it('should filter by segment', async () => {
     const result = await getFilteredProducts({
       category: 'aromas',
       segment: 'Chakra',
     });
     // This test would fail with the GROQ error
     expect(result.products).toBeInstanceOf(Array);
   });
   ```
3. **E2E Tests** ✅ **WOULD CATCH**
   ```typescript
   test('filter by segment', async ({ page }) => {
     await page.goto('/shop?category=aromas&segment=Chakra');
     // Would see error in console
     await expect(page.locator('text=/error/i')).not.toBeVisible();
   });
   ```

### Missing Dependencies

**What happened:**
- `@supabase/supabase-js` not installed
- TypeScript error in IDE
- Build would fail

**How testing prevents this:**

1. **TypeScript Type Check** ✅ **WOULD CATCH**
2. **Build Test in CI** ✅ **WOULD CATCH**
3. **Pre-commit Hook** ✅ **WOULD CATCH**

---

## 🔄 Development Workflow

### 1. Working on a Feature

```bash
# Create feature branch
git checkout -b feature/new-filter

# Make changes
# ... edit files ...

# Run tests locally
npm test
npm run test:e2e

# Commit (pre-commit hooks run automatically)
git commit -m "Add new filter feature"

# Push to GitHub
git push origin feature/new-filter
```

### 2. Create Pull Request

1. Go to GitHub and create PR
2. **GitHub Actions automatically:**
   - Runs all tests
   - Deploys preview to Vercel
   - Comments on PR with preview URL
   - Runs Lighthouse performance test

3. **Review the results:**
   - Check if all tests passed ✅
   - Test the preview deployment
   - Review Lighthouse scores

### 3. Merge to Main

1. All tests must pass ✅
2. Get code review approval
3. Merge PR
4. **Automatic production deployment** (if configured)

---

## 📊 Monitoring & Alerts

### GitHub Actions Notifications

You'll get notifications when:
- ❌ Tests fail on your PR
- ✅ All tests pass
- 🚀 Deployment completes

### Setting Up Slack/Discord Notifications (Optional)

Add this to your GitHub Actions workflow:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Tests failed! Check the logs.'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🎓 Best Practices

### 1. **Test Before You Commit**

```bash
# Always run before committing
npm run validate
```

### 2. **Write Tests for Bugs**

When you fix a bug:
1. Write a test that reproduces the bug
2. Fix the bug
3. Verify the test passes
4. Commit both the fix and the test

### 3. **Keep Tests Fast**

- Unit tests should run in milliseconds
- Integration tests in seconds
- E2E tests can take longer but keep them focused

### 4. **Test Real User Scenarios**

Focus on what users actually do:
- ✅ "User filters products by category"
- ❌ "Function returns correct array"

### 5. **Don't Skip CI Checks**

Never merge a PR with failing tests, even if you think it's "just a flaky test"

---

## 🚨 Troubleshooting

### Tests Pass Locally But Fail in CI

**Possible causes:**
- Different Node versions
- Missing environment variables
- Timing issues

**Solution:**
```powershell
# Use same Node version as CI
nvm use 20

# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### E2E Tests Timeout

**Solution:**
```typescript
// Increase timeout for slow tests
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Pre-commit Hook Not Running

**Solution:**
```bash
# Reinstall Husky
rm -rf .husky
npm run prepare
```

---

## 📚 Additional Resources

- [Full Testing Documentation](./TESTING.md)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## ✅ Checklist

Use this checklist to ensure everything is set up:

- [ ] Playwright browsers installed (`npx playwright install`)
- [ ] Husky hooks set up (`npm run prepare`)
- [ ] GitHub secrets configured
- [ ] CI workflow file exists (`.github/workflows/ci.yml`)
- [ ] Deploy preview workflow exists (`.github/workflows/deploy-preview.yml`)
- [ ] Can run `npm run validate` successfully
- [ ] Can run `npm run test:e2e` successfully
- [ ] Pre-commit hooks working (try making a commit)
- [ ] GitHub Actions running on PRs

---

## 🎉 You're All Set!

Your project now has:
- ✅ Automated testing at every stage
- ✅ Quality gates before code reaches production
- ✅ Preview deployments for testing
- ✅ Performance monitoring
- ✅ Security scanning

**Issues like the GROQ query error will be caught before they affect users!** 🎯
