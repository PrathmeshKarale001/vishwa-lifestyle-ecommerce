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
}

export default function ConditionalWrapper({ children, categories = [] }: ConditionalWrapperProps) {
  const pathname = usePathname();

  // Check if we're in the studio
  const isStudio = pathname?.startsWith('/studio');

  if (isStudio) {
    // For studio pages, return only the children without any layout components
    return <>{children}</>;
  }

  // For all other pages, render the full layout
  return (
    <>
      <SkipLink />
      <Header categories={categories} />
      <CartDrawer />
      <ScrollToTop />
      <MobileBottomNav />
      <div id="main-content">
        {children}
      </div>
      <Footer />
    </>
  );
}