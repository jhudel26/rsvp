"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { newEventDefaults } from "@/lib/events/defaults";
import { SYSTEM_TEMPLATES } from "@/lib/templates";
import type { FormSchema } from "@/types/forms";
import type { ThemePresetId } from "@/types/theme";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  const supabase = createClient();
  const router = useRouter();
  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
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

  const handleTemplateSelect = async (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = SYSTEM_TEMPLATES.find((t) => t.key === templateKey);
    if (!template) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `event-${Date.now()}`;

    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        name: formData.name || template.name,
        slug,
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
        status: "draft",
        theme_preset: template.theme_preset,
        form_schema: template.schema,
        theme_config: {},
        settings: {},
        branding: {},
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

  const handleCreateBlank = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const slug = formData.name
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
          <p className="text-gray-600">Choose a template to get started or create a blank event</p>
        </div>

        {step === "template" ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="My Event"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Name</label>
                  <input
                    type="text"
                    value={formData.host_name}
                    onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Your name"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Template</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SYSTEM_TEMPLATES.map((template) => (
                  <button
                    key={template.key}
                    onClick={() => handleTemplateSelect(template.key)}
                    disabled={loading}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:border-blue-500 hover:shadow-md transition-all disabled:opacity-50"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <span className="text-xs text-blue-600 font-medium">{template.category}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleCreateBlank}
                disabled={loading}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Start with Blank Event"}
              </button>
            </div>
          </div>
        ) : (
          <div>Details step - implement if needed</div>
        )}
      </div>
    </DashboardLayout>
  );
}
