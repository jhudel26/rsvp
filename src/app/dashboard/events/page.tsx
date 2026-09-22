"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Calendar, MapPin, Clock, MoreVertical, Copy, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  status: "draft" | "published" | "closed" | "archived";
  created_at: string;
}

export default function EventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading events:", error);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    };

    loadEvents();
  }, [supabase]);

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    } else {
      setEvents(events.filter((e) => e.id !== eventId));
    }
  };

  const handleDuplicate = async (event: Event) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("events").insert({
      user_id: user.id,
      name: `${event.name} (Copy)`,
      slug: `${event.slug}-copy-${Date.now()}`,
      description: event.description,
      event_date: event.event_date,
      location: event.location,
      status: "draft",
      form_schema: (event as any).form_schema,
      theme_config: (event as any).theme_config,
      settings: (event as any).settings,
      branding: (event as any).branding,
    } as any);

    if (error) {
      console.error("Error duplicating event:", error);
      alert("Failed to duplicate event");
    } else {
      window.location.reload();
    }
  };

  const copyEventUrl = (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
    closed: "bg-red-100 text-red-700",
    archived: "bg-yellow-100 text-yellow-700",
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading events...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1">Manage your events and RSVP forms</p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">Create your first event to start collecting RSVPs.</p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  )}

                  {event.event_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.event_date), "MMM d, yyyy")}
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Created {format(new Date(event.created_at), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </Link>
                    {event.status === "published" && (
                      <>
                        <button
                          onClick={() => copyEventUrl(event.slug)}
                          className="text-sm text-gray-600 hover:text-gray-900"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/r/${event.slug}`}
                          target="_blank"
                          className="text-sm text-gray-600 hover:text-gray-900"
                          title="View live"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(event)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
