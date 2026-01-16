# Testing & CI/CD Pipeline Architecture

## 🔄 Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPER WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Write Code      │
                    │  Make Changes    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  git commit      │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRE-COMMIT HOOKS (Husky)                     │
├─────────────────────────────────────────────────────────────────┤
│  ✓ ESLint (auto-fix)                                           │
│  ✓ Prettier (auto-format)                                      │
│  ✓ TypeScript type check                                       │
│                                                                  │
│  ❌ If fails → Commit blocked                                   │
│  ✅ If passes → Continue                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  git push        │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB ACTIONS CI/CD                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │  PUSH TO BRANCH   │       │  PULL REQUEST     │
    └───────────────────┘       └───────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────┐       ┌───────────────────┐
    │  CI Pipeline      │       │  CI Pipeline      │
    │  ─────────────    │       │  ─────────────    │
    │  1. Code Quality  │       │  1. Code Quality  │
    │  2. Build Test    │       │  2. Build Test    │
    │  3. Unit Tests    │       │  3. Unit Tests    │
    │  4. Security      │       │  4. E2E Tests     │
    └───────────────────┘       │  5. Security      │
                                │  6. Lighthouse    │
                                └───────────────────┘
                                          │
                                          ▼
                                ┌───────────────────┐
                                │  Deploy Preview   │
                                │  ─────────────    │
                                │  → Vercel         │
                                │  → Comment PR     │
                                │     with URL      │
                                └───────────────────┘
                                          │
                                          ▼
                                ┌───────────────────┐
                                │  Code Review      │
                                │  + Test Preview   │
                                └───────────────────┘
                                          │
                                          ▼
                                ┌───────────────────┐
                                │  Merge to Main    │
                                └───────────────────┘
                                          │
                                          ▼
                                ┌───────────────────┐
                                │  Production       │
                                │  Deployment       │
                                └───────────────────┘
```

## 🧪 Testing Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                         E2E TESTS                               │
│                    (Playwright - Browser)                       │
├─────────────────────────────────────────────────────────────────┤
│  • Complete user flows                                          │
│  • Real browser interactions                                    │
│  • Cross-browser testing                                        │
│  • Mobile & desktop viewports                                   │
│                                                                  │
│  Example: User filters products → adds to cart → checkout      │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION TESTS                            │
│                         (Jest)                                  │
├─────────────────────────────────────────────────────────────────┤
│  • API integrations                                             │
│  • Database queries (Sanity GROQ)                              │
│  • External service calls                                       │
│  • Component integration                                        │
│                                                                  │
│  Example: Test Sanity query returns correct filtered products  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       UNIT TESTS                                │
│                         (Jest)                                  │
├─────────────────────────────────────────────────────────────────┤
│  • Individual functions                                         │
│  • Utility helpers                                              │
│  • Business logic                                               │
│  • Component rendering                                          │
│                                                                  │
│  Example: Test formatPrice() function                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🛡️ Quality Gates

```
Code Change
    │
    ▼
┌────────────────┐
│ Type Check     │ ─── TypeScript validates types
└────────────────┘
    │ ✅
    ▼
┌────────────────┐
│ Lint Check     │ ─── ESLint catches code issues
└────────────────┘
    │ ✅
    ▼
┌────────────────┐
│ Format Check   │ ─── Prettier ensures consistency
└────────────────┘
    │ ✅
    ▼
┌────────────────┐
│ Unit Tests     │ ─── Jest validates logic
└────────────────┘
    │ ✅
    ▼
┌────────────────┐
│ Build Test     │ ─── Next.js build succeeds
└────────────────┘
    │ ✅
    ▼
┌────────────────┐
│ Integration    │ ─── API/DB queries work
└────────────────┘
    │ ✅
    ▼
┌────────────────┐
│ E2E Tests      │ ─── User flows work
└────────────────┘
    │ ✅
    ▼
┌────────────────┐
│ Security Audit │ ─── No vulnerabilities
└────────────────┘
    │ ✅
    ▼
┌────────────────┐
│ Performance    │ ─── Lighthouse scores good
└────────────────┘
    │ ✅
    ▼
  DEPLOY ✅
```

## 🔍 How Issues Are Caught

### Example: GROQ Query Error

```
Issue: Using 'match' operator on array field
      segments match $segment  ❌

┌─────────────────────────────────────────┐
│  WHERE IT'S CAUGHT                      │
├─────────────────────────────────────────┤
│  ❌ TypeScript Type Check               │
│     (Valid syntax, won't catch)         │
│                                          │
│  ❌ ESLint                               │
│     (Valid syntax, won't catch)         │
│                                          │
│  ✅ Integration Tests                   │
│     Test: Filter by segment             │
│     → Sanity query fails                │
│     → Test fails ❌                      │
│     → CI blocks merge                   │
│                                          │
│  ✅ E2E Tests                            │
│     Test: User clicks segment filter    │
│     → Page shows error                  │
│     → Test fails ❌                      │
│     → CI blocks merge                   │
└─────────────────────────────────────────┘

Result: Issue caught BEFORE production! ✅
```

### Example: Missing Dependency

```
Issue: @supabase/supabase-js not installed

┌─────────────────────────────────────────┐
│  WHERE IT'S CAUGHT                      │
├─────────────────────────────────────────┤
│  ✅ TypeScript Type Check               │
│     → Cannot find module                │
│     → Pre-commit hook blocks ❌         │
│                                          │
│  ✅ Build Test                           │
│     → npm run build fails               │
│     → CI fails ❌                        │
│     → Blocks merge                      │
└─────────────────────────────────────────┘

Result: Issue caught BEFORE commit! ✅
```

## 📊 Test Coverage Flow

```
┌──────────────┐
│  Write Code  │
└──────────────┘
       │
       ▼
┌──────────────┐
│  Run Tests   │ ──→ npm run test:coverage
└──────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Coverage Report Generated       │
│  ────────────────────────────    │
│  Statements  : 75%               │
│  Branches    : 68%               │
│  Functions   : 82%               │
│  Lines       : 74%               │
└──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Coverage Uploaded to Codecov    │
│  (Optional)                      │
└──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Badge on GitHub README          │
│  ![Coverage](badge.svg)          │
└──────────────────────────────────┘
```

## 🚀 Deployment Pipeline

```
┌─────────────┐
│  git push   │
└─────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  GitHub Actions Triggered       │
└─────────────────────────────────┘
       │
       ├──→ Push to main ──→ Production Deploy
       │
       └──→ Pull Request ──→ Preview Deploy
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Vercel Preview  │
                          └──────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Comment on PR   │
                          │  with URL        │
                          └──────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Test Preview    │
                          │  Review Code     │
                          └──────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Merge PR        │
                          └──────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Production      │
                          │  Deployment      │
                          └──────────────────┘
```

## 🎯 Summary

This multi-layered approach ensures:

1. **Pre-commit**: Catches syntax and formatting issues
2. **CI Pipeline**: Catches logic and integration issues
3. **E2E Tests**: Catches user experience issues
4. **Preview Deploys**: Allows manual testing before production
5. **Production**: Only clean, tested code reaches users

**Result: Issues are caught early, saving time and preventing user-facing bugs!** ✅
