# 🚀 Testing Quick Reference

## 📝 Daily Commands

```bash
# Before committing
npm run validate              # Run all checks

# Testing
npm test                      # Unit tests
npm run test:watch           # Watch mode
npm run test:coverage        # With coverage
npm run test:e2e             # E2E tests
npm run test:e2e:ui          # E2E interactive

# Code quality
npm run type-check           # TypeScript
npm run lint                 # Check linting
npm run lint:fix             # Fix linting
npm run format:check         # Check formatting
npm run format               # Fix formatting

# Build
npm run build                # Production build
npm run dev                  # Development server
```

## 🎯 When to Run What

| Situation | Command | Why |
|-----------|---------|-----|
| Before commit | `npm run validate` | Catch all issues |
| After pulling code | `npm test` | Ensure tests pass |
| Fixing a bug | `npm run test:watch` | TDD workflow |
| Before PR | `npm run test:e2e` | Test user flows |
| Debugging test | `npm run test:e2e:debug` | Step through |
| Check coverage | `npm run test:coverage` | See gaps |

## 🔍 Test File Locations

```
tests/
├── unit/              # Unit tests
│   └── *.test.ts
├── integration/       # Integration tests
│   └── shop.test.ts
└── e2e/              # E2E tests
    └── *.spec.ts
```

## 📊 GitHub Actions Status

Check: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI Pipeline | Push/PR | Run all tests |
| Deploy Preview | PR | Create preview |

## 🐛 Quick Fixes

### Tests failing locally?
```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

### Pre-commit hook not working?
```powershell
npm run prepare
```

### E2E tests timing out?
```typescript
test.setTimeout(60000); // In test file
```

### Type errors in tests?
```powershell
npm install --save-dev @types/jest @types/node
```

## ✅ Pre-Deployment Checklist

- [ ] `npm run validate` passes
- [ ] `npm run test:e2e` passes
- [ ] All GitHub Actions green
- [ ] Preview deployment tested
- [ ] No console errors
- [ ] Mobile tested

## 🚨 Emergency: Skip Pre-commit Hook

```bash
git commit --no-verify -m "Emergency fix"
```

**⚠️ Only use in emergencies! CI will still run.**

## 📚 Documentation

- [Full Testing Guide](./TESTING.md)
- [Setup Guide](./SETUP_TESTING.md)
- [Architecture](./TESTING_ARCHITECTURE.md)
