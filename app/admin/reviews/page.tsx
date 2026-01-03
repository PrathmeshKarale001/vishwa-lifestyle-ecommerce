"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import toast from "react-hot-toast";

interface Review {
    id: string;
    product_id: string;
    user_name: string;
    rating: number;
    title: string;
    content: string;
    status: string;
    created_at: string;
}

export default function AdminReviews() {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkAdminAndFetchReviews();
    }, []);

    const checkAdminAndFetchReviews = async () => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            router.push("/");
            return;
        }
        setIsAuthorized(true);
        fetchReviews();
    };

    const fetchReviews = async () => {
        if (!supabase) return;
        try {
            // Fetch all reviews, newest first
            const { data, error } = await supabase
                .from("reviews")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const handeStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const res = await fetch("/api/reviews", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update");

            toast.success(`Review ${newStatus}`);
            // Optimistic update
            setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-3xl font-serif">Review Moderation</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                    {reviews.length === 0 ? (
                        <div className="p-12 text-center text-foreground-muted">
                            No reviews found.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {review.status || 'pending'}
                                                </span>
                                                <span className="text-xs text-foreground-muted">{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="font-medium text-lg mb-1">{review.title}</h3>
                                            <div className="flex text-accent-gold mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                                ))}
                                            </div>
                                            <p className="text-foreground-muted text-sm mb-2">{review.content}</p>
                                            <p className="text-xs font-medium">By: {review.user_name}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {review.status !== 'approved' && (
                                                <button
                                                    onClick={() => handeStatusUpdate(review.id, 'approved')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded text-sm font-medium transition-colors"
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handeStatusUpdate(review.id, 'rejected')}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded text-sm font-medium transition-colors"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
