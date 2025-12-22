"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User, Search } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { motion } from "framer-motion";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCartStore();
  const wishlistCount = useWishlistStore((state) => state.itemCount);

  // Don't show on certain pages
  const hideOnPages = ["/checkout", "/auth", "/admin"];
  const shouldHide = hideOnPages.some((page) => pathname?.startsWith(page));

  if (shouldHide) return null;

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shop", icon: ShoppingBag, label: "Shop", badge: itemCount },
    { href: "/account/wishlist", icon: Heart, label: "Wishlist", badge: wishlistCount },
    { href: "/account", icon: User, label: "Account" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive ? "text-accent-gold" : "text-foreground-muted"
                }`}
            >
              <div className="relative">
                <Icon size={22} />
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-accent-gold text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute top-0 left-0 right-0 h-1 bg-accent-gold"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


