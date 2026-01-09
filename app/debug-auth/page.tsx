"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugAuth() {
    const [user, setUser] = useState<any>(null);
    const [adminEmails, setAdminEmails] = useState<string>("");

    useEffect(() => {
        async function check() {
            const supabase = createClient();
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            }
            setAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS || "NOT DEFINED");
        }
        check();
    }, []);

    return (
        <div className="p-10 font-mono">
            <h1 className="text-xl font-bold mb-4">Auth Debug Tool</h1>
            <div className="space-y-4">
                <div>
                    <p className="font-bold">Logged in email:</p>
                    <p className="bg-gray-100 p-2">{user?.email || "NOT LOGGED IN"}</p>
                </div>
                <div>
                    <p className="font-bold">NEXT_PUBLIC_ADMIN_EMAILS (as seen by browser):</p>
                    <p className="bg-gray-100 p-2">{adminEmails}</p>
                </div>
                <div>
                    <p className="font-bold">Admin Check Result:</p>
                    <p className="bg-gray-100 p-2 whitespace-pre-wrap">
                        {user?.email && adminEmails.split(',').map(e => e.trim()).includes(user.email)
                            ? "✅ ADMIN"
                            : "❌ NOT ADMIN"}
                    </p>
                </div>
            </div>
        </div>
    );
}
