"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    User,
    Package,
    Heart,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    Edit2,
} from "lucide-react";
import EditProfileModal from "@/components/EditProfileModal";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";
import ProductCard from "@/components/ProductCard";

interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    phone: string | null;
    created_at: string;
}

interface Order {
    id: string;
    created_at: string;
    status: string;
    total: number;
    items: any[];
}

interface AccountContentProps {
    initialUser: UserProfile;
    initialOrders: Order[];
    initialWishlistCount: number;
    recentlyViewed: any[];
}

export default function AccountContent({
    initialUser,
    initialOrders,
    initialWishlistCount,
    recentlyViewed,
}: AccountContentProps) {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile>(initialUser);
    const [isEditing, setIsEditing] = useState(false);

    const menuItems = [
        { icon: Package, label: "My Orders", href: "/account/orders", count: initialOrders.length },
        { icon: Heart, label: "Wishlist", href: "/account/wishlist", count: initialWishlistCount },
        { icon: MapPin, label: "Addresses", href: "/account/addresses" },
        { icon: Settings, label: "Settings", href: "/account/settings" },
    ];

    const handleProfileUpdate = async () => {
        const supabase = createClient();
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                setUser({
                    id: authUser.id,
                    email: authUser.email || "",
                    name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
                    avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
                    phone: authUser.phone || null,
                    created_at: authUser.created_at,
                });
            }
        } catch (error) {
            log.error("Error refreshing user", error);
        }
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        try {
            await supabase.auth.signOut();
            toast.success("Signed out successfully");
            router.push("/");
            router.refresh();
        } catch (error) {
            toast.error("Failed to sign out");
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getMemberSince = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "delivered":
                return "text-green-600 bg-green-50";
            case "processing":
                return "text-blue-600 bg-blue-50";
            case "shipped":
                return "text-purple-600 bg-purple-50";
            case "cancelled":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    {/* Profile Card */}
                    <div className="bg-background-alt p-6 mb-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center overflow-hidden">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name || "User"}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User size={24} className="text-accent-gold" />
                                )}
                            </div>
                            <div>
                                <h2 className="font-serif text-lg">{user.name || "Welcome!"}</h2>
                                <p className="text-sm text-foreground-muted">
                                    Member since {getMemberSince(user.created_at)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full border border-gray-200 py-2 text-sm flex items-center justify-center gap-2 hover:bg-white transition-colors"
                        >
                            <Edit2 size={14} /> Edit Profile
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center justify-between p-4 bg-background-alt hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className="text-foreground-muted" />
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.count !== undefined && item.count > 0 && (
                                        <span className="text-xs bg-accent-gold text-white px-2 py-0.5 rounded-full">
                                            {item.count}
                                        </span>
                                    )}
                                    <ChevronRight size={16} className="text-foreground-muted" />
                                </div>
                            </Link>
                        ))}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 p-4 w-full text-left text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} />
                            <span className="text-sm">Sign Out</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Recent Orders */}
                    <div className="bg-background-alt p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-xl">Recent Orders</h2>
                            <Link
                                href="/account/orders"
                                className="text-sm text-accent-gold hover:underline"
                            >
                                View All
                            </Link>
                        </div>

                        {initialOrders.length > 0 ? (
                            <div className="space-y-4">
                                {initialOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/account/orders/${order.id}`}
                                        className="block bg-white p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                                            <span
                                                className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-foreground-muted">
                                            <span>{formatDate(order.created_at)}</span>
                                            <span>
                                                {order.items?.length || 0} item(s) · {formatPrice(order.total)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-foreground-muted mb-4">No orders yet</p>
                                <Link
                                    href="/shop"
                                    className="text-accent-gold hover:underline"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recently Viewed Products */}
                    {recentlyViewed.length > 0 && (
                        <div className="bg-background-alt p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-xl">Recently Viewed</h2>
                                <Link
                                    href="/shop"
                                    className="text-sm text-accent-gold hover:underline"
                                >
                                    Browse All
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recentlyViewed.slice(0, 4).map((item) => (
                                    <ProductCard
                                        key={item.id}
                                        id={item.id}
                                        slug={item.slug}
                                        name={item.name}
                                        price={item.price}
                                        image={item.image || "/placeholder-product.svg"}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Account Details */}
                    <div className="bg-background-alt p-6">
                        <h2 className="font-serif text-xl mb-6">Account Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs uppercase tracking-widest text-foreground-muted block mb-2">
                                    Full Name
                                </label>
                                <p className="font-medium">{user.name || "Not set"}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-foreground-muted block mb-2">
                                    Email
                                </label>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-foreground-muted block mb-2">
                                    Phone
                                </label>
                                <p className="font-medium">{user.phone || "Not set"}</p>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-foreground-muted block mb-2">
                                    Member Since
                                </label>
                                <p className="font-medium">{getMemberSince(user.created_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                user={user}
                onUpdate={handleProfileUpdate}
            />
        </>
    );
}
