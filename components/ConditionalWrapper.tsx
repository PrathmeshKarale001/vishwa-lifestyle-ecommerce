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

  if (isStudio) {
    // For studio pages, return only the children without any layout components
    return <>{children}</>;
  }

  // For all other pages, render the full layout
  return (
    <>
      <SkipLink />
      <Header categories={categories} settings={settings} />
      <CartDrawer />
      <ScrollToTop />
      <MobileBottomNav />
      <main
        id="main-content"
        className={`${!isHomePage ? (settings?.announcementBar?.show ? 'pt-[86px] sm:pt-[104px]' : 'pt-[56px] sm:pt-[72px]') : ''} min-h-screen`}
      >
        {children}
      </main>
      <Footer settings={settings} />
    </>
  );
}