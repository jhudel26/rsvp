"use client";

import { RequireAuth } from "@/components/auth/require-auth";
import { DashboardNav } from "./dashboard-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardNav />

        <main className="flex-1 ml-64">
          <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
              )}
              <LogoutButton />
            </div>
          </header>

          <div className="p-8">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}
