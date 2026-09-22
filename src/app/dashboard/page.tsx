"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalResponses: number;
  attending: number;
  notAttending: number;
  maybe: number;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    totalResponses: 0,
    attending: 0,
    notAttending: 0,
    maybe: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [eventsResult, responsesResult] = await Promise.all([
        supabase.from("events").select("*").eq("user_id", user.id),
        supabase.from("form_responses").select("*, events(user_id)").eq("events.user_id", user.id),
      ]);

      const events = (eventsResult.data as any[]) || [];
      const responses = (responsesResult.data as any[]) || [];

      setStats({
        totalEvents: events.length,
        publishedEvents: events.filter((e: any) => e.status === "published").length,
        draftEvents: events.filter((e: any) => e.status === "draft").length,
        totalResponses: responses.length,
        attending: responses.filter((r: any) => r.attendance === "attending").length,
        notAttending: responses.filter((r: any) => r.attendance === "not_attending").length,
        maybe: responses.filter((r: any) => r.attendance === "maybe").length,
      });

      setLoading(false);
    };

    loadStats();
  }, [supabase]);

  const statCards = [
    { label: "Total Events", value: stats.totalEvents, icon: Calendar, color: "blue" },
    { label: "Published Events", value: stats.publishedEvents, icon: CheckCircle, color: "green" },
    { label: "Draft Events", value: stats.draftEvents, icon: Clock, color: "yellow" },
    { label: "Total Responses", value: stats.totalResponses, icon: Users, color: "purple" },
  ];

  const responseCards = [
    { label: "Attending", value: stats.attending, icon: CheckCircle, color: "green" },
    { label: "Not Attending", value: stats.notAttending, icon: XCircle, color: "red" },
    { label: "Maybe", value: stats.maybe, icon: Clock, color: "yellow" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              const colorClasses = {
                blue: "bg-blue-50 text-blue-600",
                green: "bg-green-50 text-green-600",
                yellow: "bg-yellow-50 text-yellow-600",
                purple: "bg-purple-50 text-purple-600",
                red: "bg-red-50 text-red-600",
              };

              return (
                <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">{card.label}</span>
                    <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">RSVP Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {responseCards.map((card) => {
              const Icon = card.icon;
              const colorClasses = {
                green: "bg-green-50 text-green-600",
                red: "bg-red-50 text-red-600",
                yellow: "bg-yellow-50 text-yellow-600",
              };

              return (
                <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">{card.label}</span>
                    <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        {stats.totalEvents === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to get started with RSVP collection.</p>
            <a
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create your first event
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
