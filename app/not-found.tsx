import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-16 flex items-center">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <span className="text-[150px] md:text-[200px] font-serif font-bold text-background-alt leading-none">
              404
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif mb-4">Page Not Found</h1>
          <p className="text-foreground-muted text-lg mb-8">
            The page you're looking for seems to have wandered off the sacred path.
            Let's guide you back.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-foreground text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors"
            >
              <Home size={16} /> Go Home
            </Link>
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 border border-foreground text-foreground px-6 py-3 text-sm uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors"
            >
              <Search size={16} /> Browse Shop
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-sm uppercase tracking-widest text-foreground-muted mb-6">
              You might be looking for
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "Agnihotra Essentials", href: "/shop?category=ritual" },
                { label: "Sacred Home", href: "/shop?category=lifestyle" },
                { label: "Our Story", href: "/story" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 bg-background-alt text-sm hover:bg-accent-gold hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

