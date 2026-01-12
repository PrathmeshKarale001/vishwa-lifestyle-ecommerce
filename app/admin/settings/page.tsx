"use client";

import { useState } from "react";
import { Save, User, Shield, Bell } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    const handleSave = () => {
        toast.success("Settings saved successfully (Simulation)");
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-serif">Settings</h1>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-foreground text-white hover:bg-black transition-colors"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "general"
                                ? "border-b-2 border-accent-gold text-foreground"
                                : "text-gray-500 hover:text-foreground"
                                }`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "security"
                                ? "border-b-2 border-accent-gold text-foreground"
                                : "text-gray-500 hover:text-foreground"
                                }`}
                        >
                            Security
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === "general" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                        <User size={20} /> Store Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Store Name</label>
                                            <input
                                                type="text"
                                                defaultValue="Vishwa Lifestyle"
                                                className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-accent-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Support Email</label>
                                            <input
                                                type="email"
                                                defaultValue="crm@vishwaglobal.com"
                                                className="w-full px-4 py-2 border border-gray-200 focus:outline-none focus:border-accent-gold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                        <Shield size={20} /> Admin Access
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Admin access is currently restricted via Environment Variables and Middleware.
                                    </p>
                                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                        <p className="font-mono text-xs text-gray-600">
                                            Allowed Emails: {(process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'Not Configured').replace(',', ', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
