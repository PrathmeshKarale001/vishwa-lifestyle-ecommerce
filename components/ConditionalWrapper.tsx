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

  // Check if we're in the studio
  const isStudio = pathname?.startsWith('/studio');
  const isHomePage = pathname === '/';

  const mainClasses = isStudio
    ? 'min-h-screen'
    : `${!isHomePage ? (settings?.announcementBar?.show ? 'pt-[86px] sm:pt-[104px]' : 'pt-[56px] sm:pt-[72px]') : ''} min-h-screen`;

  return (
    <>
      {!isStudio && <SkipLink />}
      {!isStudio && <Header categories={categories} settings={settings} />}
      {!isStudio && <CartDrawer />}
      {!isStudio && <ScrollToTop />}
      {!isStudio && <MobileBottomNav />}
      <main
        id="main-content"
        className={mainClasses}
        suppressHydrationWarning
      >
        {children}
      </main>
      {!isStudio && <Footer settings={settings} />}
    </>
  );
}