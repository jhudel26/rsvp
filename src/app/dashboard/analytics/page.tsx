"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Users, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const dynamic = "force-dynamic";

interface AnalyticsData {
  totalEvents: number;
  totalResponses: number;
  attending: number;
  notAttending: number;
  maybe: number;
  totalGuests: number;
  recentResponses: number;
  responsesByEvent: { name: string; responses: number }[];
  attendanceByEvent: { name: string; attending: number; notAttending: number; maybe: number }[];
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export default function AnalyticsPage() {
  const supabase = createClient();
  const [data, setData] = useState<AnalyticsData>({
    totalEvents: 0,
    totalResponses: 0,
    attending: 0,
    notAttending: 0,
    maybe: 0,
    totalGuests: 0,
    recentResponses: 0,
    responsesByEvent: [],
    attendanceByEvent: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [eventsResult, responsesResult] = await Promise.all([
        supabase.from("events").select("id, name").eq("user_id", user.id),
        supabase.from("form_responses").select("*, events(id, name)").eq("events.user_id", user.id),
      ]);

      const events = (eventsResult.data as any[]) || [];
      const responses = (responsesResult.data as any[]) || [];

      const responsesByEvent = events.map((event: any) => ({
        name: event.name,
        responses: responses.filter((r: any) => r.event_id === event.id).length,
      }));

      const attendanceByEvent = events.map((event: any) => {
        const eventResponses = responses.filter((r: any) => r.event_id === event.id);
        return {
          name: event.name,
          attending: eventResponses.filter((r: any) => r.attendance === "attending").length,
          notAttending: eventResponses.filter((r: any) => r.attendance === "not_attending").length,
          maybe: eventResponses.filter((r: any) => r.attendance === "maybe").length,
        };
      });

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      setData({
        totalEvents: events.length,
        totalResponses: responses.length,
        attending: responses.filter((r: any) => r.attendance === "attending").length,
        notAttending: responses.filter((r: any) => r.attendance === "not_attending").length,
        maybe: responses.filter((r: any) => r.attendance === "maybe").length,
        totalGuests: responses.reduce((sum: number, r: any) => sum + r.guest_count, 0),
        recentResponses: responses.filter((r: any) => new Date(r.created_at) > oneWeekAgo).length,
        responsesByEvent,
        attendanceByEvent,
      });

      setLoading(false);
    };

    loadAnalytics();
  }, [supabase]);

  const pieData = [
    { name: "Attending", value: data.attending },
    { name: "Not Attending", value: data.notAttending },
    { name: "Maybe", value: data.maybe },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Overview of your RSVP performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Total Events</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.totalEvents}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Total Responses</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.totalResponses}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Total Guests</span>
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.totalGuests}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Recent (7 days)</span>
              <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.recentResponses}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Responses by Event</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.responsesByEvent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance by Event</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.attendanceByEvent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attending" stackId="a" fill="#10b981" name="Attending" />
              <Bar dataKey="maybe" stackId="a" fill="#f59e0b" name="Maybe" />
              <Bar dataKey="notAttending" stackId="a" fill="#ef4444" name="Not Attending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {data.totalResponses === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No responses yet</h3>
            <p className="text-gray-600">Publish your events and start collecting RSVPs to see analytics.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
