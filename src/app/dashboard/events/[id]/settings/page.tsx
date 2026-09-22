"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Globe, Lock, Calendar, Bell, FileText } from "lucide-react";
import type { EventSettings } from "@/types/events";
import { defaultSettings } from "@/lib/events/defaults";

export const dynamic = "force-dynamic";

export default function EventSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const [settings, setSettings] = useState<EventSettings>(defaultSettings());
  const [eventDetails, setEventDetails] = useState({
    name: "",
    slug: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    address: "",
    maps_url: "",
    host_name: "",
    contact_email: "",
    contact_phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", params.id as string).single();

      if (error) {
        console.error("Error loading event:", error);
        router.push("/dashboard/events");
      } else {
        const eventData = data as any;
        setSettings(eventData.settings || defaultSettings());
        setEventDetails({
          name: eventData.name,
          slug: eventData.slug,
          description: eventData.description || "",
          event_date: eventData.event_date || "",
          start_time: eventData.start_time || "",
          end_time: eventData.end_time || "",
          location: eventData.location || "",
          address: eventData.address || "",
          maps_url: eventData.maps_url || "",
          host_name: eventData.host_name || "",
          contact_email: eventData.contact_email || "",
          contact_phone: eventData.contact_phone || "",
        });
      }

      setLoading(false);
    };

    loadEvent();
  }, [supabase, params.id, router]);

  const handleSave = async () => {
    setSaving(true);

    const { error } = await (supabase as any)
      .from("events")
      .update({
        ...eventDetails,
        settings,
        event_date: eventDetails.event_date || null,
        start_time: eventDetails.start_time || null,
        end_time: eventDetails.end_time || null,
      })
      .eq("id", params.id as string);

    if (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/events/${params.id}`} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-gray-600 text-sm">Configure your event settings</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Event Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
              <input
                type="text"
                value={eventDetails.name}
                onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                value={eventDetails.slug}
                onChange={(e) => setEventDetails({ ...eventDetails, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={eventDetails.description}
                onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={eventDetails.event_date}
                onChange={(e) => setEventDetails({ ...eventDetails, event_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={eventDetails.start_time}
                onChange={(e) => setEventDetails({ ...eventDetails, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={eventDetails.end_time}
                onChange={(e) => setEventDetails({ ...eventDetails, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={eventDetails.location}
                onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={eventDetails.address}
                onChange={(e) => setEventDetails({ ...eventDetails, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps URL</label>
              <input
                type="url"
                value={eventDetails.maps_url}
                onChange={(e) => setEventDetails({ ...eventDetails, maps_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Host Name</label>
              <input
                type="text"
                value={eventDetails.host_name}
                onChange={(e) => setEventDetails({ ...eventDetails, host_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={eventDetails.contact_email}
                onChange={(e) => setEventDetails({ ...eventDetails, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={eventDetails.contact_phone}
                onChange={(e) => setEventDetails({ ...eventDetails, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            RSVP Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RSVP Deadline</label>
              <input
                type="date"
                value={settings.rsvpDeadline || ""}
                onChange={(e) => setSettings({ ...settings, rsvpDeadline: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.allowMultipleSubmissions}
                  onChange={(e) => setSettings({ ...settings, allowMultipleSubmissions: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Allow multiple submissions
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.requireEmail}
                  onChange={(e) => setSettings({ ...settings, requireEmail: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Require email
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum guests per response</label>
              <input
                type="number"
                value={settings.maxGuests || 0}
                onChange={(e) => setSettings({ ...settings, maxGuests: parseInt(e.target.value) || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.allowEditResponse}
                onChange={(e) => setSettings({ ...settings, allowEditResponse: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Allow guests to edit their response
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.notifyOnSubmit}
                onChange={(e) => setSettings({ ...settings, notifyOnSubmit: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Send email notification when RSVP is submitted
            </label>

            {settings.notifyOnSubmit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email</label>
                <input
                  type="email"
                  value={settings.notificationEmail || ""}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Privacy
          </h3>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.isPrivate}
                onChange={(e) => setSettings({ ...settings, isPrivate: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Make event private
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.requireInvitationCode}
                onChange={(e) => setSettings({ ...settings, requireInvitationCode: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Require invitation code
            </label>

            {settings.requireInvitationCode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invitation Code</label>
                <input
                  type="text"
                  value={settings.invitationCode || ""}
                  onChange={(e) => setSettings({ ...settings, invitationCode: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Messages</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Title</label>
              <input
                type="text"
                value={settings.confirmationTitle}
                onChange={(e) => setSettings({ ...settings, confirmationTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Message</label>
              <textarea
                value={settings.confirmationMessage}
                onChange={(e) => setSettings({ ...settings, confirmationMessage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Closed Message</label>
              <textarea
                value={settings.closedMessage}
                onChange={(e) => setSettings({ ...settings, closedMessage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
