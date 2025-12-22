import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import Breadcrumbs from "@/components/Breadcrumbs";
import SettingsContent from "@/components/SettingsContent";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Initial settings (could be fetched from DB in future)
  const initialSettings = {
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    smsNotifications: false,
    twoFactorAuth: false,
    language: "en",
    currency: "INR",
    theme: "light",
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs
            items={[
              { label: "Account", href: "/account" },
              { label: "Settings" },
            ]}
            className="mb-6"
          />

          <h1 className="text-3xl font-serif mb-8">Settings</h1>
          <SettingsContent initialSettings={initialSettings} />
        </div>
      </div>

    </main>
  );
}

