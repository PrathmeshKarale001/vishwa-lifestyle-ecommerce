# Optimization Backlog

Ranked by impact on Core Web Vitals (LCP > INP > CLS) and Security.

| Rank | Target | Component/File | Action | CWV Impact |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **LCP** | `components/Hero.tsx` | Replace `backgroundImage` with `next/image` + `priority`. | 🟢 High |
| 2 | **LCP** | `components/LifestylePreview.tsx` | Replace `backgroundImage` with `next/image`. | 🟢 High |
| 3 | **LCP** | `components/StorySection.tsx` | Replace `<img>` with `next/image`. | 🟡 Medium |
| 4 | **INP/Hydration** | `components/ShopGrid.tsx` | Move data fetching to Server Component or optimize client-side fetch with `Suspense`. | 🟡 Medium |
| 5 | **Bundle Size** | `components/Providers.tsx` | Lazy load `CookieConsent` and `Analytics`. | 🟡 Medium |
| 6 | **Security/Auth** | `lib/supabase.ts` | Migrate to @supabase/ssr for cookie-based session handling. | 🛡️ Security |
| 7 | **CLS** | All Components | Implement fixed aspect ratios for all containers holding dynamic content/images. | 🔵 Low |
| 8 | **Performance** | `next.config.ts` | Add `images.unoptimized` override for static assets if needed, ensure AVIF support. | 🔵 Low |

## Next Steps
1. Start with Rank 1: **Hero LCP Fix**.
2. Proceed to **Supabase Auth hardening** to ensure production-grade security.
