"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { newEventDefaults } from "@/lib/events/defaults";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const slug = formData.slug || formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `event-${Date.now()}`;

    const defaults = newEventDefaults(formData.name, slug);

    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        ...defaults,
        description: formData.description,
        event_date: formData.event_date || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        location: formData.location,
        address: formData.address,
        maps_url: formData.maps_url,
        host_name: formData.host_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
      } as any)
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
    } else {
      router.push(`/dashboard/events/${(data as any).id}/builder`);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Fill in the event details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="My Event"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="my-event"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from event name</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Describe your event..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Event venue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Full address"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps URL</label>
              <input
                type="url"
                value={formData.maps_url}
                onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://maps.google.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Host Name</label>
              <input
                type="text"
                value={formData.host_name}
                onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Event host"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
