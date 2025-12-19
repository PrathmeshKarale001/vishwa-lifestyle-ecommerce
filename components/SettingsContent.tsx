"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Bell,
    Shield,
    Globe,
    Loader2,
    Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { log } from "@/lib/logger";

interface SettingsContentProps {
    initialSettings: any;
}

export default function SettingsContent({ initialSettings }: SettingsContentProps) {
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(initialSettings);

    const handleSave = async () => {
        setSaving(true);
        try {
            // In the future, save to user preferences table
            // For now, just show success
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success("Settings saved successfully!");
            setSaving(false);
        } catch (error) {
            log.error("Error saving settings", error);
            toast.error("Unable to save settings. Please try again.");
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-background-alt p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Bell size={20} className="text-accent-gold" />
                    <h2 className="font-serif text-xl">Notifications</h2>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <span className="font-medium">Email Notifications</span>
                            <p className="text-sm text-foreground-muted">
                                Receive updates about your orders and account
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) =>
                                setSettings({ ...settings, emailNotifications: e.target.checked })
                            }
                            className="accent-accent-gold"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <span className="font-medium">Order Updates</span>
                            <p className="text-sm text-foreground-muted">
                                Get notified when your order status changes
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.orderUpdates}
                            onChange={(e) =>
                                setSettings({ ...settings, orderUpdates: e.target.checked })
                            }
                            className="accent-accent-gold"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <span className="font-medium">Marketing Emails</span>
                            <p className="text-sm text-foreground-muted">
                                Receive offers, new product announcements, and more
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.marketingEmails}
                            onChange={(e) =>
                                setSettings({ ...settings, marketingEmails: e.target.checked })
                            }
                            className="accent-accent-gold"
                        />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <span className="font-medium">SMS Notifications</span>
                            <p className="text-sm text-foreground-muted">
                                Receive order updates via SMS
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.smsNotifications}
                            onChange={(e) =>
                                setSettings({ ...settings, smsNotifications: e.target.checked })
                            }
                            className="accent-accent-gold"
                        />
                    </label>
                </div>
            </div>

            {/* Security */}
            <div className="bg-background-alt p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Shield size={20} className="text-accent-gold" />
                    <h2 className="font-serif text-xl">Security</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-medium">Password</span>
                            <p className="text-sm text-foreground-muted">
                                Change your account password
                            </p>
                        </div>
                        <Link
                            href="/account/change-password"
                            className="text-sm text-accent-gold hover:underline"
                        >
                            Change Password
                        </Link>
                    </div>

                    <label className="flex items-center justify-between cursor-pointer">
                        <div>
                            <span className="font-medium">Two-Factor Authentication</span>
                            <p className="text-sm text-foreground-muted">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.twoFactorAuth}
                            onChange={(e) =>
                                setSettings({ ...settings, twoFactorAuth: e.target.checked })
                            }
                            className="accent-accent-gold"
                        />
                    </label>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-background-alt p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Globe size={20} className="text-accent-gold" />
                    <h2 className="font-serif text-xl">Preferences</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-2">Language</label>
                        <select
                            value={settings.language}
                            onChange={(e) =>
                                setSettings({ ...settings, language: e.target.value })
                            }
                            className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-accent-gold"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी (Hindi)</option>
                            <option value="mr">मराठी (Marathi)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-2">Currency</label>
                        <select
                            value={settings.currency}
                            onChange={(e) =>
                                setSettings({ ...settings, currency: e.target.value })
                            }
                            className="w-full border border-gray-200 px-4 py-3 focus:outline-none focus:border-accent-gold"
                        >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-foreground text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-accent-gold transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} /> Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
