# 🛍️ Shopify Conversion Checklist - Vishwa Lifestyle

**Goal:** Convert React/Next.js website to Shopify custom theme while keeping React version as backup.

**Timeline:** 2-3 weeks  
**Risk Level:** Low (React version remains untouched)

---

## 📋 **PHASE 1: PREPARATION & SETUP** (Day 1-2)

### ✅ **1.1 Backup Current React Version**
- [ ] Create final backup: `Vishwa-Lifestyle-REACT-FINAL-BACKUP.zip`
- [ ] Verify Netlify deployment is live and working
- [ ] Document all current features and pages
- [ ] Take screenshots of all pages for reference

### ✅ **1.2 Shopify Account Setup**
- [ ] Create Shopify Partner account (free): https://partners.shopify.com
- [ ] Create development store: "Vishwa Lifestyle Dev"
- [ ] Install Shopify CLI: `npm install -g @shopify/cli @shopify/theme`
- [ ] Login to Shopify CLI: `shopify auth login`

### ✅ **1.3 Create New Project Folder**
```bash
# Don't touch the original!
cd /Users/prathmeshkarale/Downloads
cp -r Vishwa-Lifestyle Vishwa-Lifestyle-Shopify
cd Vishwa-Lifestyle-Shopify
```

- [ ] Initialize new git repo: `git init`
- [ ] Create `.gitignore` for Shopify
- [ ] Document: "This is Shopify version, React backup in parent folder"

### ✅ **1.4 Shopify Theme Setup**
- [ ] Create new theme: `shopify theme init`
- [ ] Choose "Blank theme" or "Dawn theme" as base
- [ ] Set up theme structure:
  ```
  themes/vishwa-lifestyle/
  ├── assets/
  ├── config/
  ├── layout/
  ├── sections/
  ├── snippets/
  ├── templates/
  └── locales/
  ```

---

## 📋 **PHASE 2: DESIGN SYSTEM CONVERSION** (Day 3-5)

### ✅ **2.1 Colors & Typography**
- [ ] Convert CSS variables to Shopify theme settings
- [ ] Set up color palette in `config/settings_schema.json`:
  - [ ] Background colors (white, off-white)
  - [ ] Accent colors (gold, sage, terracotta)
  - [ ] Text colors (charcoal, muted)
- [ ] Configure fonts in theme settings:
  - [ ] Playfair Display (serif)
  - [ ] Lato (sans-serif)
- [ ] Test color/font changes in theme editor

### ✅ **2.2 CSS/Styling Conversion**
- [ ] Convert `globals.css` → `assets/theme.css`
- [ ] Convert Tailwind classes to custom CSS
- [ ] Set up CSS variables in `:root`
- [ ] Test responsive breakpoints
- [ ] Verify animations work (or convert to CSS animations)

### ✅ **2.3 Assets Migration**
- [ ] Copy all images from `public/` → `assets/`
- [ ] Optimize images for web
- [ ] Set up image lazy loading
- [ ] Create SVG icons if needed

---

## 📋 **PHASE 3: COMPONENT CONVERSION** (Day 6-12)

### ✅ **3.1 Header Component**
**React:** `components/Header.tsx`  
**Shopify:** `sections/header.liquid` + `snippets/header-nav.liquid`

- [ ] Convert header structure to Liquid
- [ ] Make navigation editable in theme editor
- [ ] Add mobile menu functionality
- [ ] Convert scroll behavior
- [ ] Add cart icon with count
- [ ] Test on all screen sizes

**Theme Settings Needed:**
- Logo upload
- Navigation menu links
- Cart icon toggle
- Mobile menu settings

---

### ✅ **3.2 Hero Section**
**React:** `components/Hero.tsx`  
**Shopify:** `sections/hero.liquid`

- [ ] Convert carousel/slider to Shopify section
- [ ] Make slides editable in theme editor:
  - [ ] Image upload
  - [ ] Title text
  - [ ] Subtitle text
  - [ ] CTA button text & link
- [ ] Convert Framer Motion animations to CSS
- [ ] Add slide indicators
- [ ] Test auto-play functionality

**Theme Settings Needed:**
- Number of slides
- Slide images (repeatable)
- Slide titles, subtitles
- CTA button text & links
- Auto-play toggle
- Transition speed

---

### ✅ **3.3 Lifestyle Preview Section**
**React:** `components/LifestylePreview.tsx`  
**Shopify:** `sections/lifestyle-preview.liquid`

- [ ] Convert grid layout to Liquid
- [ ] Make categories editable:
  - [ ] Category images
  - [ ] Category titles
  - [ ] Category links
- [ ] Convert hover effects to CSS
- [ ] Make grid responsive

**Theme Settings Needed:**
- Number of categories
- Category images (repeatable)
- Category titles
- Category links

---

### ✅ **3.4 Story Section**
**React:** `components/StorySection.tsx`  
**Shopify:** `sections/story.liquid`

- [ ] Convert two-column layout
- [ ] Make content editable:
  - [ ] Image upload
  - [ ] Heading text
  - [ ] Body paragraphs
- [ ] Convert animations to CSS
- [ ] Test image aspect ratios

**Theme Settings Needed:**
- Story image
- Heading text
- Paragraph 1
- Paragraph 2
- Image position (left/right)

---

### ✅ **3.5 Shop Grid / Product Grid**
**React:** `components/ShopGrid.tsx`  
**Shopify:** `sections/featured-collection.liquid` (or custom)

- [ ] Use Shopify's product system
- [ ] Create products in Shopify admin:
  - [ ] Agnihotra Kit
  - [ ] Sambrani Cups
  - [ ] Copper Pyramid
  - [ ] Pure Cow Ghee
  - [ ] All other products
- [ ] Convert product cards to Liquid
- [ ] Add "Quick Add" functionality
- [ ] Display product tags (Best Seller, New, etc.)
- [ ] Add product filtering (if needed)

**Shopify Setup:**
- [ ] Create product collections:
  - [ ] Ritual Essentials
  - [ ] Lifestyle & Sacred Home
  - [ ] Vishwa Apparel
  - [ ] Combos & Gifts
- [ ] Add product images
- [ ] Set product prices
- [ ] Add product descriptions
- [ ] Set up product tags

---

### ✅ **3.6 Philosophy Section**
**React:** `components/PhilosophySection.tsx`  
**Shopify:** `sections/philosophy.liquid`

- [ ] Convert to editable section
- [ ] Make text content editable
- [ ] Convert image to theme setting
- [ ] Test responsive layout

---

### ✅ **3.7 Benefit Strip**
**React:** `components/BenefitStrip.tsx`  
**Shopify:** `sections/benefit-strip.liquid`

- [ ] Convert 4-column grid
- [ ] Make benefits editable:
  - [ ] Icon/image
  - [ ] Title
  - [ ] Description
- [ ] Test on mobile (stack columns)

---

### ✅ **3.8 Footer Component**
**React:** `components/Footer.tsx`  
**Shopify:** `snippets/footer.liquid`

- [ ] Convert footer structure
- [ ] Make links editable via navigation
- [ ] Add newsletter signup (Shopify form)
- [ ] Add social media links
- [ ] Make copyright text editable

**Shopify Setup:**
- [ ] Create footer navigation menus
- [ ] Set up email marketing integration
- [ ] Add social media accounts

---

## 📋 **PHASE 4: PAGE CONVERSIONS** (Day 13-15)

### ✅ **4.1 Homepage**
**React:** `app/page.tsx`  
**Shopify:** `templates/index.liquid`

- [ ] Combine all sections in order:
  - [ ] Hero
  - [ ] Lifestyle Preview
  - [ ] Story Section
  - [ ] Shop Grid
  - [ ] Philosophy Section
  - [ ] Benefit Strip
- [ ] Make sections draggable in theme editor
- [ ] Test section visibility toggles
- [ ] Verify all animations work

---

### ✅ **4.2 Ingredients Page**
**React:** `app/ingredients/page.tsx`  
**Shopify:** `templates/page.ingredients.liquid` or `pages/ingredients.liquid`

- [ ] Convert hero section
- [ ] Convert sourcing philosophy (4 principles)
- [ ] Convert ingredients grid (6 items)
- [ ] Make all content editable via page editor
- [ ] Test image loading
- [ ] Verify responsive layout

**Shopify Setup:**
- [ ] Create "Ingredients" page in admin
- [ ] Add all content via page editor
- [ ] Upload ingredient images

---

### ✅ **4.3 Our Story Page**
**React:** `app/story/page.tsx`  
**Shopify:** `templates/page.story.liquid` or `pages/story.liquid`

- [ ] Convert hero section
- [ ] Convert origin story (two-column)
- [ ] Convert timeline (5 milestones)
- [ ] Convert values section (4 values)
- [ ] Convert vision section
- [ ] Convert statistics section
- [ ] Make all content editable

**Shopify Setup:**
- [ ] Create "Our Story" page in admin
- [ ] Add all content via page editor
- [ ] Upload story images

---

### ✅ **4.4 Shop Page**
**React:** `app/shop/page.tsx`  
**Shopify:** `templates/collection.liquid` (default) or custom

- [ ] Use Shopify's collection template
- [ ] Customize product grid layout
- [ ] Add filtering options
- [ ] Add sorting options
- [ ] Add "View All" functionality
- [ ] Test product pagination

---

### ✅ **4.5 Product Page**
**React:** `app/product/page.tsx`  
**Shopify:** `templates/product.liquid` (default) or custom

- [ ] Customize product template
- [ ] Add product image gallery
- [ ] Add product description
- [ ] Add "Add to Cart" button
- [ ] Add quantity selector
- [ ] Add product variants (if needed)
- [ ] Add related products section

---

## 📋 **PHASE 5: E-COMMERCE FUNCTIONALITY** (Day 16-18)

### ✅ **5.1 Shopping Cart**
- [ ] Test default Shopify cart
- [ ] Customize cart drawer/page if needed
- [ ] Add cart icon with item count
- [ ] Test cart functionality
- [ ] Test cart updates
- [ ] Test cart removal

### ✅ **5.2 Checkout**
- [ ] Configure Shopify checkout settings
- [ ] Set up payment methods:
  - [ ] Credit cards (Stripe/Razorpay)
  - [ ] UPI (for India)
  - [ ] Cash on Delivery (if needed)
- [ ] Test checkout flow
- [ ] Set up order confirmation emails

### ✅ **5.3 Shipping**
- [ ] Configure shipping zones (India)
- [ ] Set shipping rates
- [ ] Add free shipping threshold (if applicable)
- [ ] Test shipping calculator
- [ ] Set up shipping labels (Shiprocket/Delhivery)

### ✅ **5.4 Taxes**
- [ ] Configure GST for India
- [ ] Set tax rates by state
- [ ] Test tax calculations
- [ ] Add tax-inclusive pricing option

---

## 📋 **PHASE 6: CONTENT MIGRATION** (Day 19-20)

### ✅ **6.1 Products**
- [ ] Create all products in Shopify admin
- [ ] Upload product images
- [ ] Add product descriptions
- [ ] Set prices
- [ ] Add product tags
- [ ] Organize into collections
- [ ] Set inventory levels

### ✅ **6.2 Pages**
- [ ] Create "Ingredients" page
- [ ] Create "Our Story" page
- [ ] Add all content
- [ ] Upload images
- [ ] Test page links

### ✅ **6.3 Navigation**
- [ ] Set up main navigation menu
- [ ] Set up footer menus
- [ ] Add all links
- [ ] Test navigation on mobile

### ✅ **6.4 SEO**
- [ ] Add meta titles to all pages
- [ ] Add meta descriptions
- [ ] Add Open Graph tags
- [ ] Create XML sitemap
- [ ] Add structured data (JSON-LD)
- [ ] Test with Google Search Console

---

## 📋 **PHASE 7: TESTING & POLISH** (Day 21-22)

### ✅ **7.1 Functionality Testing**
- [ ] Test all page navigation
- [ ] Test product browsing
- [ ] Test add to cart
- [ ] Test checkout process
- [ ] Test form submissions
- [ ] Test search functionality
- [ ] Test filters/sorting

### ✅ **7.2 Design Testing**
- [ ] Test on desktop (1920px, 1440px, 1280px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on mobile (375px, 414px)
- [ ] Test all animations
- [ ] Test hover states
- [ ] Verify color consistency
- [ ] Verify typography

### ✅ **7.3 Browser Testing**
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### ✅ **7.4 Performance Testing**
- [ ] Run Lighthouse audit
- [ ] Optimize images
- [ ] Minimize CSS/JS
- [ ] Test page load speed
- [ ] Test Core Web Vitals

### ✅ **7.5 Content Review**
- [ ] Proofread all text
- [ ] Check all images load
- [ ] Verify all links work
- [ ] Check spelling/grammar
- [ ] Verify pricing is correct

---

## 📋 **PHASE 8: DEPLOYMENT** (Day 23-24)

### ✅ **8.1 Pre-Launch Checklist**
- [ ] Final backup of React version
- [ ] Document all Shopify settings
- [ ] Test on development store
- [ ] Get client approval
- [ ] Prepare launch plan

### ✅ **8.2 Production Setup**
- [ ] Create production Shopify store (or convert dev store)
- [ ] Set up custom domain
- [ ] Configure SSL certificate
- [ ] Set up Google Analytics
- [ ] Set up email notifications
- [ ] Configure payment gateways
- [ ] Set up shipping

### ✅ **8.3 Theme Deployment**
- [ ] Upload theme to production store
- [ ] Activate theme
- [ ] Test all functionality
- [ ] Verify all content migrated
- [ ] Test checkout with real payment (small amount)

### ✅ **8.4 Post-Launch**
- [ ] Monitor for errors
- [ ] Check analytics
- [ ] Test customer journey
- [ ] Gather feedback
- [ ] Make quick fixes if needed

---

## 📋 **PHASE 9: BACKUP & DOCUMENTATION** (Day 25)

### ✅ **9.1 Keep React Version Safe**
- [ ] Verify React version still works on Netlify
- [ ] Document React version location
- [ ] Create final React backup
- [ ] Keep React code in separate folder
- [ ] Document how to switch back if needed

### ✅ **9.2 Documentation**
- [ ] Document all Shopify settings
- [ ] Create admin user guide
- [ ] Document custom sections
- [ ] Create troubleshooting guide
- [ ] Document theme customization options

### ✅ **9.3 Handover**
- [ ] Train client on Shopify admin
- [ ] Show how to add products
- [ ] Show how to edit content
- [ ] Show how to manage orders
- [ ] Provide documentation

---

## 🔄 **ROLLBACK PLAN (If Shopify Doesn't Work)**

### If You Need to Go Back to React:

1. **Immediate Rollback:**
   - React version is still on Netlify
   - Just point domain back to Netlify
   - No code changes needed

2. **Enhance React Version:**
   - Add e-commerce features to React
   - Integrate payment gateway (Razorpay/Stripe)
   - Add shopping cart functionality
   - Build checkout flow
   - Add order management

3. **Timeline:**
   - Rollback: Instant (just change DNS)
   - Enhance React: 6-8 weeks additional work

---

## 📊 **CONVERSION MAPPING REFERENCE**

### React → Shopify File Mapping

| React Component | Shopify File | Type |
|----------------|--------------|------|
| `components/Header.tsx` | `sections/header.liquid` | Section |
| `components/Hero.tsx` | `sections/hero.liquid` | Section |
| `components/LifestylePreview.tsx` | `sections/lifestyle-preview.liquid` | Section |
| `components/StorySection.tsx` | `sections/story.liquid` | Section |
| `components/ShopGrid.tsx` | `sections/featured-collection.liquid` | Section |
| `components/PhilosophySection.tsx` | `sections/philosophy.liquid` | Section |
| `components/BenefitStrip.tsx` | `sections/benefit-strip.liquid` | Section |
| `components/Footer.tsx` | `snippets/footer.liquid` | Snippet |
| `app/page.tsx` | `templates/index.liquid` | Template |
| `app/ingredients/page.tsx` | `pages/ingredients.liquid` | Page |
| `app/story/page.tsx` | `pages/story.liquid` | Page |
| `app/shop/page.tsx` | `templates/collection.liquid` | Template |
| `app/product/page.tsx` | `templates/product.liquid` | Template |
| `app/globals.css` | `assets/theme.css` | Asset |
| `app/layout.tsx` | `theme.liquid` | Layout |

---

## 🛠️ **TOOLS & RESOURCES**

### Shopify CLI Commands
```bash
# Login
shopify auth login

# Create theme
shopify theme init

# Start dev server
shopify theme dev

# Push to store
shopify theme push

# Pull from store
shopify theme pull
```

### Useful Shopify Docs
- Theme Development: https://shopify.dev/docs/themes
- Liquid Reference: https://shopify.dev/docs/api/liquid
- Theme Settings: https://shopify.dev/docs/themes/architecture/settings
- Sections: https://shopify.dev/docs/themes/architecture/sections

### Testing Tools
- Shopify Theme Inspector (browser extension)
- Lighthouse (performance testing)
- Browser DevTools
- Responsive Design Mode

---

## ✅ **SUCCESS CRITERIA**

Your Shopify conversion is successful when:

- [ ] All pages match React version design
- [ ] All sections are editable in theme editor
- [ ] Products can be added/edited in Shopify admin
- [ ] Shopping cart works
- [ ] Checkout process completes
- [ ] Payments process successfully
- [ ] Orders are received and manageable
- [ ] Site is mobile responsive
- [ ] Performance is good (Lighthouse > 90)
- [ ] Client can manage content themselves
- [ ] React version is safely backed up

---

## 📝 **NOTES & TIPS**

### Design Preservation
- Take screenshots of React version for reference
- Use browser DevTools to inspect exact colors/spacing
- Keep React code open side-by-side while converting

### Performance
- Optimize images before uploading
- Use Shopify's CDN for assets
- Minimize custom JavaScript
- Use CSS animations instead of JS where possible

### Client Independence
- Make as much as possible editable in theme editor
- Use Shopify's built-in features (collections, products)
- Document how to edit content
- Create simple admin guides

### Backup Strategy
- Commit React version to git before starting
- Create zip backup before conversion
- Keep React version deployed on Netlify
- Don't delete React code until Shopify is proven

---

## 🎯 **FINAL CHECKLIST**

Before considering conversion complete:

- [ ] React version backed up and safe
- [ ] Shopify version matches design
- [ ] All functionality works
- [ ] Client trained on Shopify admin
- [ ] Documentation complete
- [ ] Performance optimized
- [ ] SEO configured
- [ ] Payments working
- [ ] Shipping configured
- [ ] Ready for production

---

**Remember:** Your React version is your safety net. Keep it safe, keep it working, and you can always go back! 🛡️

