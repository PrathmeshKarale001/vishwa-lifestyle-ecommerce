"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react"; // If using NextAuth, or custom hook.
// The project seems to use custom Supabase auth in lib/supabase, but let's check how auth is used in components.
// Header.tsx might show how auth is handled. I'll stick to a generic approach or check localStorage/context.
// For now, I'll build verification into the API call flow mostly.
import toast from "react-hot-toast";

interface Review {
    id: string;
    user_name: string;
    rating: number;
    title?: string;
    content: string;
    created_at: string;
}

export default function ReviewsSection({ productId, initialShowForm = false }: { productId: string; initialShowForm?: boolean }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(initialShowForm);

    // Form state
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            if (res.ok && data.reviews) {
                setReviews(Array.isArray(data.reviews) ? data.reviews : []);
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    rating,
                    title,
                    content
                }),
            });

            if (res.status === 401) {
                toast.error("Please sign in to submit a review.");
                setSubmitting(false);
                return;
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit review");
            }

            toast.success("Review submitted. It will appear after moderation.");
            setShowForm(false);
            setTitle("");
            setContent("");
            setRating(5);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="py-12 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h3 className="text-2xl font-serif text-foreground mb-2">Customer Reviews</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex text-accent-gold">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={16} fill={star <= 4 ? "currentColor" : "none"} className={star <= 4 ? "" : "text-gray-300"} />
                            ))}
                        </div>
                        <span className="text-sm text-foreground-muted">{(reviews || []).length} Review{((reviews || []).length) !== 1 && 's'}</span>
                    </div>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-2 bg-foreground text-white text-sm uppercase tracking-widest hover:bg-foreground/90 transition-colors"
                >
                    {showForm ? "Cancel Review" : "Write a Review"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-8 max-w-2xl animate-in fade-in slide-in-from-top-4">
                    <h4 className="text-lg font-medium mb-4">Write a Review</h4>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={24}
                                        className={star <= rating ? "text-accent-gold fill-current" : "text-gray-300"}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:border-accent-gold"
                            placeholder="Summary of your experience"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Review</label>
                        <textarea
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border rounded border-gray-300 focus:outline-none focus:border-accent-gold"
                            placeholder="Tell us what you think..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3 bg-accent-gold text-white text-sm font-medium uppercase tracking-widest hover:bg-accent-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="text-center py-8">Loading reviews...</div>
            ) : (reviews || []).length > 0 ? (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex text-accent-gold text-xs">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} className={star <= review.rating ? "" : "text-gray-300"} />
                                            ))}
                                        </div>
                                        <span className="font-medium text-sm">{review.user_name}</span>
                                    </div>
                                    {review.title && <h5 className="font-medium text-foreground">{review.title}</h5>}
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-foreground-muted text-sm leading-relaxed">{review.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-foreground-muted">No reviews yet. Be the first to share your experience!</p>
                </div>
            )}
        </div>
    );
}
