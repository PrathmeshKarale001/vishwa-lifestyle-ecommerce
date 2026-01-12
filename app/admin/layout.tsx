"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Star,
    Tag,
    Settings,
    LogOut,
    Menu,
    X,
    CreditCard,
    AlertTriangle,
    ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Signed out successfully");
        router.push("/auth/login");
    };

    const menuItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Orders", href: "/admin/orders", icon: Package },
        { name: "Products", href: "/studio", icon: ShoppingBag, external: true },
        { name: "Inventory", href: "/admin/inventory", icon: AlertTriangle },
        { name: "Customers", href: "/admin/customers", icon: Users },
        { name: "Reviews", href: "/admin/reviews", icon: Star },
        { name: "Coupons", href: "/admin/coupons", icon: Tag },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                        <Link href="/" className="font-serif font-bold text-xl tracking-wide">
                            VISHWA
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            if (item.external) {
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-foreground-muted hover:bg-gray-50 hover:text-foreground transition-colors group"
                                    >
                                        <Icon size={20} className="text-gray-400 group-hover:text-foreground" />
                                        {item.name}
                                        <ExternalLink size={14} className="ml-auto opacity-0 group-hover:opacity-100" />
                                    </a>
                                );
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive
                                            ? "bg-accent-gold/10 text-accent-gold"
                                            : "text-foreground-muted hover:bg-gray-50 hover:text-foreground"
                                        }
                  `}
                                >
                                    <Icon size={20} className={isActive ? "text-accent-gold" : "text-gray-400"} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold">
                                {user?.email?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {user?.user_metadata?.full_name || "Admin"}
                                </p>
                                <p className="text-xs text-foreground-muted truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                {/* Mobile Header */}
                <header className="h-16 lg:hidden bg-white border-b border-gray-200 flex items-center px-4 justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-serif font-bold text-lg">Admin Panel</span>
                    <div className="w-10" /> {/* Spacer for centering */}
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
