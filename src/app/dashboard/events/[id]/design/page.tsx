"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Palette, Eye } from "lucide-react";
import { THEME_PRESETS, THEME_GALLERY, cloneTheme, FONT_OPTIONS } from "@/lib/themes/presets";
import type { ThemeConfig, ThemePresetId } from "@/types/theme";

export const dynamic = "force-dynamic";

export default function DesignPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(THEME_PRESETS.custom);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      const { data, error } = await supabase.from("events").select("theme_config, theme_preset").eq("id", params.id as string).single();

      if (error) {
        console.error("Error loading event:", error);
        router.push("/dashboard/events");
      } else {
        setThemeConfig((data as any)?.theme_config || THEME_PRESETS[(data as any)?.theme_preset as ThemePresetId] || THEME_PRESETS.custom);
      }

      setLoading(false);
    };

    loadEvent();
  }, [supabase, params.id, router]);

  const handlePresetChange = (presetId: ThemePresetId) => {
    setThemeConfig(cloneTheme(presetId));
  };

  const handleColorChange = (colorKey: keyof ThemeConfig["colors"], value: string) => {
    setThemeConfig({
      ...themeConfig,
      colors: { ...themeConfig.colors, [colorKey]: value },
    });
  };

  const handleFontChange = (fontKey: keyof ThemeConfig["typography"], value: string | number) => {
    setThemeConfig({
      ...themeConfig,
      typography: { ...themeConfig.typography, [fontKey]: value },
    });
  };

  const handleLayoutChange = (layout: ThemeConfig["layout"]) => {
    setThemeConfig({ ...themeConfig, layout });
  };

  const handleBackgroundChange = (type: ThemeConfig["background"]["type"], value: string) => {
    setThemeConfig({
      ...themeConfig,
      background: { ...themeConfig.background, type, value },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await (supabase as any).from("events").update({ theme_config: themeConfig }).eq("id", params.id as string);

    if (error) {
      console.error("Error saving design:", error);
      alert("Failed to save design");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading design settings...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/events/${params.id}`} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Design</h1>
                <p className="text-gray-600 text-sm">Customize your event's appearance</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/r/${params.id}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Design"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme Presets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {THEME_GALLERY.map((presetId) => (
                <button
                  key={presetId}
                  onClick={() => handlePresetChange(presetId)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    themeConfig.presetId === presetId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="w-full aspect-square rounded mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${THEME_PRESETS[presetId].colors.primary} 0%, ${THEME_PRESETS[presetId].colors.secondary} 100%)`,
                    }}
                  />
                  <p className="text-sm font-medium text-gray-900 capitalize">{presetId.replace("_", " ")}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(themeConfig.colors).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof ThemeConfig["colors"], e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof ThemeConfig["colors"], e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Typography</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
                <select
                  value={themeConfig.typography.headingFont}
                  onChange={(e) => handleFontChange("headingFont", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Font</label>
                <select
                  value={themeConfig.typography.bodyFont}
                  onChange={(e) => handleFontChange("bodyFont", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Size (px)</label>
                <input
                  type="number"
                  value={themeConfig.typography.baseSize}
                  onChange={(e) => handleFontChange("baseSize", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="12"
                  max="24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Weight</label>
                <select
                  value={themeConfig.typography.headingWeight}
                  onChange={(e) => handleFontChange("headingWeight", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={400}>Normal</option>
                  <option value={500}>Medium</option>
                  <option value={600}>Semi Bold</option>
                  <option value={700}>Bold</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Layout</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["centered", "wide", "card", "fullscreen", "split"].map((layout) => (
                <button
                  key={layout}
                  onClick={() => handleLayoutChange(layout as ThemeConfig["layout"])}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    themeConfig.layout === layout
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 capitalize">{layout}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Background</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-4">
                  {["solid", "gradient"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleBackgroundChange(type as ThemeConfig["background"]["type"], themeConfig.background.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        themeConfig.background.type === type
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeConfig.background.value}
                    onChange={(e) => handleBackgroundChange(themeConfig.background.type, e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={themeConfig.background.value}
                    onChange={(e) => handleBackgroundChange(themeConfig.background.type, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              {themeConfig.background.type === "gradient" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={themeConfig.background.secondary || "#ffffff"}
                      onChange={(e) =>
                        setThemeConfig({
                          ...themeConfig,
                          background: { ...themeConfig.background, secondary: e.target.value },
                        })
                      }
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeConfig.background.secondary || "#ffffff"}
                      onChange={(e) =>
                        setThemeConfig({
                          ...themeConfig,
                          background: { ...themeConfig.background, secondary: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-96 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div
              className="aspect-[3/4] rounded-lg overflow-hidden"
              style={{
                background:
                  themeConfig.background.type === "gradient"
                    ? `linear-gradient(135deg, ${themeConfig.background.value} 0%, ${themeConfig.background.secondary || themeConfig.background.value} 100%)`
                    : themeConfig.background.value,
                fontFamily: themeConfig.typography.bodyFont,
              }}
            >
              <div
                className="p-6 h-full flex flex-col"
                style={{
                  backgroundColor: themeConfig.colors.card,
                  color: themeConfig.colors.text,
                }}
              >
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{
                    fontFamily: themeConfig.typography.headingFont,
                    color: themeConfig.colors.primary,
                    fontWeight: themeConfig.typography.headingWeight,
                  }}
                >
                  Event Title
                </h2>
                <p className="text-sm mb-4" style={{ color: themeConfig.colors.muted }}>
                  Event description goes here
                </p>
                <div className="mt-auto">
                  <button
                    className="w-full py-3 rounded-lg font-medium"
                    style={{
                      backgroundColor: themeConfig.colors.button,
                      color: themeConfig.colors.buttonText,
                      borderRadius: `${themeConfig.buttonStyle.radius}px`,
                    }}
                  >
                    Submit RSVP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
