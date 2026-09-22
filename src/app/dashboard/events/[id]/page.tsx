"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Share2, Copy, CheckCircle } from "lucide-react";
import { QRCode } from "@/components/qr-code";

export const dynamic = "force-dynamic";

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  address: string | null;
  maps_url: string | null;
  host_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: "draft" | "published" | "closed" | "archived";
  created_at: string;
}

export default function EventDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", params.id as string).single();

      if (error) {
        console.error("Error loading event:", error);
        router.push("/dashboard/events");
      } else {
        setEvent(data as Event);
      }

      setLoading(false);
    };

    loadEvent();
  }, [supabase, params.id, router]);

  const handlePublish = async () => {
    if (!event) return;

    setSaving(true);
    const { error } = await (supabase as any).from("events").update({ status: "published", published_at: new Date().toISOString() }).eq("id", event.id);

    if (error) {
      console.error("Error publishing event:", error);
      alert("Failed to publish event");
    } else {
      setEvent({ ...event, status: "published" as const });
    }

    setSaving(false);
  };

  const copyEventUrl = () => {
    if (!event) return;
    const url = `${window.location.origin}/r/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading event...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Event not found</p>
          <Link href="/dashboard/events" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to events
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", href: `/dashboard/events/${event.id}` },
    { id: "builder", label: "Form Builder", href: `/dashboard/events/${event.id}/builder` },
    { id: "design", label: "Design", href: `/dashboard/events/${event.id}/design` },
    { id: "responses", label: "Responses", href: `/dashboard/events/${event.id}/responses` },
    { id: "settings", label: "Settings", href: `/dashboard/events/${event.id}/settings` },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/events" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{event.name}</h1>
              <p className="text-gray-600 text-sm">{event.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {event.status === "published" && (
              <>
                <button
                  onClick={copyEventUrl}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <a
                  href={`/r/${event.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Live
                </a>
              </>
            )}

            {event.status === "draft" && (
              <button
                onClick={handlePublish}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Publishing..." : "Publish"}
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
              <p className="text-gray-900">{event.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.status === "published" ? "bg-green-100 text-green-700" :
                event.status === "draft" ? "bg-gray-100 text-gray-700" :
                "bg-red-100 text-red-700"
              }`}>
                {event.status}
              </span>
            </div>

            {event.description && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900">{event.description}</p>
              </div>
            )}

            {event.event_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <p className="text-gray-900">{new Date(event.event_date).toLocaleDateString()}</p>
              </div>
            )}

            {event.location && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <p className="text-gray-900">{event.location}</p>
              </div>
            )}

            {event.host_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Host</label>
                <p className="text-gray-900">{event.host_name}</p>
              </div>
            )}

            {event.contact_email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <p className="text-gray-900">{event.contact_email}</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href={`/dashboard/events/${event.id}/builder`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Edit Form
            </Link>
          </div>

        {event.status === "published" && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Share Your Event</h3>
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">RSVP Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/r/${event.slug}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyEventUrl}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">QR Code</label>
                <QRCode value={`${window.location.origin}/r/${event.slug}`} eventName={event.name} size={120} />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
