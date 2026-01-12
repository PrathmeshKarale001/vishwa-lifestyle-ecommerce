'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import SkipLink from "@/components/SkipLink";
import ScrollToTop from "@/components/ScrollToTop";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";

interface ConditionalWrapperProps {
  children: ReactNode;
  categories?: any[];
  settings?: any;
}

export default function ConditionalWrapper({ children, categories = [], settings }: ConditionalWrapperProps) {
  const pathname = usePathname();

  // Check if we're in the studio or admin panel
  const isStudio = pathname?.startsWith('/studio');
  const isAdmin = pathname?.startsWith('/admin');
  const isExcluded = isStudio || isAdmin;
  const isHomePage = pathname === '/';

  const mainClasses = isExcluded
    ? 'min-h-screen'
    : `${!isHomePage ? (settings?.announcementBar?.show ? 'pt-[86px] sm:pt-[104px]' : 'pt-[56px] sm:pt-[72px]') : ''} min-h-screen`;

  return (
    <>
      {!isExcluded && <SkipLink />}
      {!isExcluded && <Header categories={categories} settings={settings} />}
      {!isExcluded && <CartDrawer />}
      {!isExcluded && <ScrollToTop />}
      {!isExcluded && <MobileBottomNav />}
      <main
        id="main-content"
        className={mainClasses}
        suppressHydrationWarning
      >
        {children}
      </main>
      {!isExcluded && <Footer settings={settings} />}
    </>
  );
}