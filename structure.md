# Project Structure

marsos-frontend
├── public
│   ├── ar
│   │   ├── payments
│   │   │   ├── applepay.png
│   │   │   ├── googlepay.jpeg
│   │   │   ├── mada.png
│   │   │   ├── master.png
│   │   │   ├── sadad.png
│   │   │   ├── sar_symbol.svg
│   │   │   ├── saudi_business_logo.svg
│   │   │   ├── tabby.png
│   │   │   ├── tamara.png
│   │   │   └── visa.png
│   │   └── og-image-ar.png
│   ├── en
│   │   ├── payments
│   │   │   ├── applepay.png
│   │   │   ├── googlepay.jpeg
│   │   │   ├── mada.png
│   │   │   ├── master.png
│   │   │   ├── sadad.png
│   │   │   ├── sar_symbol.svg
│   │   │   ├── saudi_business_logo.svg
│   │   │   ├── tabby.png
│   │   │   ├── tamara.png
│   │   │   └── visa.png
│   │   └── og-image-en.png
│   └── images
│       ├── hero
│       │   ├── 1stbanner.png
│       │   ├── 2ndbanner.png
│       │   ├── 3rdbanner.png
│       │   ├── about-hero.jpg
│       │   ├── about-hero2.jpg
│       │   ├── hero-background.png
│       │   ├── hero-bg-mobile.jpg
│       │   ├── hero-bg.jpg
│       │   ├── marsos-hero-bg-1.jpg
│       │   ├── marsos-hero-bg-2.jpg
│       │   ├── marsos-hero-bg-3.jpg
│       │   ├── marsos-hero-bg-4.jpg
│       │   ├── mission.jpg
│       │   └── vision.jpg
│       ├── logos
│       │   ├── company-banner-default.jpg
│       │   ├── company-logo-default.jpg
│       │   ├── logo.png
│       │   └── logo.svg
│       └── payments
│           ├── applepay.png
│           ├── googlepay.jpeg
│           ├── mada.png
│           ├── master.png
│           ├── sadad.png
│           ├── sar_symbol.svg
│           ├── saudi_business_logo.svg
│           ├── tabby.png
│           ├── tamara.png
│           └── visa.png
├── src
│   ├── components
│   │   ├── admin
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminStatCard.tsx
│   │   │   ├── AdminTopbar.tsx
│   │   │   └── RequireAdmin.tsx
│   │   ├── global
│   │   │   ├── productSearch
│   │   │   │   ├── ProductSearch.tsx
│   │   │   │   └── ProductSearchClient.tsx
│   │   │   ├── DateDropdownPicker.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LanguageSelector.tsx
│   │   │   ├── MobileMenuSheet.tsx
│   │   │   ├── ProductCardMinimal.tsx
│   │   │   └── ProductDetails.tsx
│   │   ├── home
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── HeroCategoriesBar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HeroSlides.tsx
│   │   │   ├── HeroTrendingBar.tsx
│   │   │   ├── HomeContent.tsx
│   │   │   ├── TrendingProducts.tsx
│   │   │   └── TrendingSlider.tsx
│   │   └── ui
│   │       ├── base
│   │       │   ├── aspect-ratio.tsx
│   │       │   ├── button.tsx
│   │       │   ├── calendar.tsx
│   │       │   ├── carousel.tsx
│   │       │   ├── item.tsx
│   │       │   ├── scroll-area.tsx
│   │       │   └── slider.tsx
│   │       ├── data-display
│   │       │   ├── accordion.tsx
│   │       │   ├── avatar.tsx
│   │       │   ├── badge.tsx
│   │       │   ├── card.tsx
│   │       │   ├── chart.tsx
│   │       │   ├── collapsible.tsx
│   │       │   ├── kbd.tsx
│   │       │   ├── pagination.tsx
│   │       │   ├── progress.tsx
│   │       │   ├── resizable.tsx
│   │       │   ├── separator.tsx
│   │       │   ├── skeleton.tsx
│   │       │   └── table.tsx
│   │       ├── feedback
│   │       │   ├── alert-dialog.tsx
│   │       │   ├── alert.tsx
│   │       │   ├── empty.tsx
│   │       │   ├── sonner.tsx
│   │       │   ├── spinner.tsx
│   │       │   └── tooltip.tsx
│   │       ├── form
│   │       │   ├── checkbox.tsx
│   │       │   ├── field.tsx
│   │       │   ├── form.tsx
│   │       │   ├── input-group.tsx
│   │       │   ├── input-otp.tsx
│   │       │   ├── input.tsx
│   │       │   ├── label.tsx
│   │       │   ├── radio-group.tsx
│   │       │   ├── select.tsx
│   │       │   ├── switch.tsx
│   │       │   └── textarea.tsx
│   │       ├── navigation
│   │       │   ├── breadcrumb.tsx
│   │       │   ├── button-group.tsx
│   │       │   ├── menubar.tsx
│   │       │   ├── sidebar.tsx
│   │       │   ├── tabs.tsx
│   │       │   ├── toggle-group.tsx
│   │       │   └── toggle.tsx
│   │       └── overlay
│   │           ├── command.tsx
│   │           ├── context-menu.tsx
│   │           ├── dialog.tsx
│   │           ├── drawer.tsx
│   │           ├── dropdown-menu.tsx
│   │           ├── hover-card.tsx
│   │           ├── navigation-menu.tsx
│   │           ├── popover.tsx
│   │           └── sheet.tsx
│   ├── hooks
│   │   ├── use-mobile.ts
│   │   ├── useAdminStats.ts
│   │   └── useUserLogin.ts
│   ├── lib
│   │   ├── i18n
│   │   │   ├── locales
│   │   │   │   ├── ar.json
│   │   │   │   └── en.json
│   │   │   └── i18n.ts
│   │   ├── api.ts
│   │   ├── supabaseClient.ts
│   │   ├── supabaseServer.ts
│   │   └── utils.ts
│   ├── providers
│   │   └── RootProvider.tsx
│   ├── routes
│   │   ├── admin
│   │   │   ├── dashboard
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── Overview.tsx
│   │   │   │   ├── Products.tsx
│   │   │   │   ├── Settings.tsx
│   │   │   │   └── Users.tsx
│   │   │   └── login
│   │   │       └── AdminLogin.tsx
│   │   ├── user
│   │   │   ├── buyer
│   │   │   │   ├── BuyerLayout.tsx
│   │   │   │   ├── BuyerOnboarding.tsx
│   │   │   │   ├── Cart.tsx
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── layout
│   │   │   │   └── UserLayout.tsx
│   │   │   ├── login
│   │   │   │   └── UserLogin.tsx
│   │   │   ├── supplier
│   │   │   │   ├── products
│   │   │   │   │   └── ManageProducts.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── SupplierLayout.tsx
│   │   │   │   └── SupplierOnboarding.tsx
│   │   │   └── UserChoices.tsx
│   │   └── Home.tsx
│   ├── state
│   │   ├── useAuthStore.ts
│   │   ├── useCartStore.ts
│   │   ├── useOnboardingStore.ts
│   │   └── useUIStore.ts
│   ├── types
│   │   ├── admin.ts
│   │   └── moment-hijri.d.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .dockerignore
├── .env
├── .gitignore
├── components.json
├── docker-compose.yml
├── Dockerfile
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
