"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Copy, Layers } from "lucide-react";
import { SYSTEM_TEMPLATES } from "@/lib/templates";
import type { FormTemplate } from "@/types/events";

export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("form_templates")
        .select("*")
        .or(`is_system.eq.true,user_id.eq.${user.id}`)
        .order("is_system", { ascending: false });

      if (error) {
        console.error("Error loading templates:", error);
      } else {
        setTemplates(data || []);
      }

      setLoading(false);
    };

    loadTemplates();
  }, [supabase]);

  const handleUseTemplate = async (template: FormTemplate) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const slug = `event-${Date.now()}`;

    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        name: template.name,
        slug,
        description: template.description,
        status: "draft",
        theme_preset: template.theme_preset,
        form_schema: template.form_schema,
        theme_config: {},
        settings: {},
        branding: {},
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating event from template:", error);
      alert("Failed to create event from template");
    } else {
      router.push(`/dashboard/events/${(data as any).id}/builder`);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    const { error } = await supabase.from("form_templates").delete().eq("id", templateId);

    if (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    } else {
      setTemplates(templates.filter((t) => t.id !== templateId));
    }
  };

  const handleSaveAsTemplate = async (eventId: string, templateName: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: event } = await supabase.from("events").select("form_schema, theme_preset").eq("id", eventId).single();

    if (!event) return;

    const eventData = event as any;
    const { error } = await supabase.from("form_templates").insert({
      user_id: user.id,
      name: templateName,
      description: "Custom template",
      category: "Custom",
      form_schema: eventData.form_schema,
      theme_preset: eventData.theme_preset,
      is_system: false,
    } as any);

    if (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template");
    } else {
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading templates...</div>
        </div>
      </DashboardLayout>
    );
  }

  const systemTemplates = templates.filter((t) => t.is_system);
  const customTemplates = templates.filter((t) => !t.is_system);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
            <p className="text-gray-600 text-sm">Start with a pre-built form or create your own</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            System Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <span className="text-xs text-blue-600 font-medium">{template.category}</span>
                </div>

                <div className="border-t border-gray-200 px-6 py-4">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customTemplates.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <span className="text-xs text-blue-600 font-medium">{template.category}</span>
                  </div>

                  <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Use Template
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {customTemplates.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <Layers className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No custom templates yet</h3>
            <p className="text-gray-600 mb-4">Save your form designs as templates to reuse them later.</p>
            <p className="text-sm text-gray-500">You can save any event as a template from the event settings.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
