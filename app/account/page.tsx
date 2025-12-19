import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import AccountContent from "@/components/AccountContent";
import { headers } from "next/headers";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch orders
  let orders = [];
  try {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    orders = data || [];
  } catch (e) { }

  // Fetch wishlist count
  let wishlistCount = 0;
  try {
    const { count } = await supabase
      .from("wishlists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    wishlistCount = count || 0;
  } catch (e) { }

  const userProfile = {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    phone: user.phone || null,
    created_at: user.created_at,
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-serif mb-8">My Account</h1>
          <AccountContent
            initialUser={userProfile}
            initialOrders={orders}
            initialWishlistCount={wishlistCount}
            recentlyViewed={[]} // Recently viewed is still client-only via localStorage
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
