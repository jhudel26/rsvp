"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EventRecord } from "@/types/events";
import type { FormSchema, FormField } from "@/types/forms";
import { validateSchema, isFieldVisible, extractGuestMeta } from "@/lib/forms/logic";
import { flattenFields } from "@/lib/forms/catalog";
import { Calendar, MapPin, Clock, Mail, Phone, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface RSVPFormProps {
  event: EventRecord;
}

export default function RSVPForm({ event }: RSVPFormProps) {
  const supabase = createClient();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  // Add safety check for event
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600">Event data is missing.</p>
        </div>
      </div>
    );
  }

  const schema: FormSchema = event.form_schema || { sections: [] };
  const fields = flattenFields(schema).filter(f => f && f.type);

  // Safe theme config with fallbacks
  const themeConfig = event.theme_config || {
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#f59e0b",
      background: "#ffffff",
      text: "#1e293b",
      button: "#3b82f6",
      buttonText: "#ffffff",
      card: "#ffffff",
      muted: "#64748b",
    },
    typography: {
      headingFont: "system-ui",
      bodyFont: "system-ui",
    },
  };

  // Safe colors access
  const safeColors = (themeConfig as any).colors || {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#f59e0b",
    background: "#ffffff",
    text: "#1e293b",
    button: "#3b82f6",
    buttonText: "#ffffff",
    card: "#ffffff",
    muted: "#64748b",
  };

  const safeTypography = (themeConfig as any).typography || {
    headingFont: "system-ui",
    bodyFont: "system-ui",
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setAnswers({ ...answers, [fieldId]: value });
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateSchema(schema, answers, event.settings.requireEmail);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const guestMeta = extractGuestMeta(schema, answers);

    const { error } = await supabase.from("form_responses").insert({
      event_id: event.id,
      answers,
      guest_name: guestMeta.guest_name,
      guest_email: guestMeta.guest_email,
      attendance: guestMeta.attendance,
      guest_count: guestMeta.guest_count,
      status: "submitted",
    } as any);

    setLoading(false);

    if (error) {
      console.error("Error submitting RSVP:", error);
      alert("Failed to submit RSVP. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invitationCode === event.settings.invitationCode) {
      setCodeVerified(true);
    } else {
      alert("Invalid invitation code");
    }
  };

  const renderField = (field: FormField) => {
    if (!field || !field.type) return null;
    if (!isFieldVisible(field, schema, answers)) return null;

    const error = errors[field.id];

    switch (field.type) {
      case "short_text":
      case "email":
      case "phone":
        return (
          <div key={field.id} className={`mb-4 ${field.width === "half" ? "w-1/2 pr-2" : field.width === "third" ? "w-1/3 pr-2" : "w-full"}`}>
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
              value={answers[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                borderColor: error ? safeColors.button : "#e5e7eb",
                backgroundColor: safeColors.card,
                color: safeColors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "long_text":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={answers[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                borderColor: error ? safeColors.button : "#e5e7eb",
                backgroundColor: safeColors.card,
                color: safeColors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "number":
      case "guest_count":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={answers[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value) || 0)}
              min={field.min}
              max={field.max}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                borderColor: error ? safeColors.button : "#e5e7eb",
                backgroundColor: safeColors.card,
                color: safeColors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={answers[field.id] === option.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span style={{ color: safeColors.text }}>{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "dropdown":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={answers[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                borderColor: error ? safeColors.button : "#e5e7eb",
                backgroundColor: safeColors.card,
                color: safeColors.text,
              }}
            >
              <option value="">Select an option</option>
              {field.options?.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={(answers[field.id] as string[])?.includes(option.value)}
                    onChange={(e) => {
                      const current = (answers[field.id] as string[]) || [];
                      if (e.target.checked) {
                        handleFieldChange(field.id, [...current, option.value]);
                      } else {
                        handleFieldChange(field.id, current.filter((v) => v !== option.value));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span style={{ color: safeColors.text }}>{option.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "yes_no":
      case "maybe":
      case "attendance":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-4">
              {field.options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleFieldChange(field.id, option.value)}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    answers[field.id] === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{
                    backgroundColor: answers[field.id] === option.value ? safeColors.primary : safeColors.card,
                    color: answers[field.id] === option.value ? safeColors.buttonText : safeColors.text,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={answers[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                borderColor: error ? safeColors.button : "#e5e7eb",
                backgroundColor: safeColors.card,
                color: safeColors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "time":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: safeColors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="time"
              value={answers[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                borderColor: error ? safeColors.button : "#e5e7eb",
                backgroundColor: safeColors.card,
                color: safeColors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "heading":
        return (
          <div key={field.id} className="mb-6">
            <h3
              className="text-2xl font-bold"
              style={{
                color: safeColors.primary,
                fontFamily: safeTypography.headingFont,
              }}
            >
              {field.label}
            </h3>
          </div>
        );

      case "paragraph":
        return (
          <div key={field.id} className="mb-6">
            <p
              className="text-gray-600"
              style={{
                color: safeColors.muted,
                fontFamily: safeTypography.bodyFont,
              }}
            >
              {field.content}
            </p>
          </div>
        );

      case "divider":
        return <hr key={field.id} className="my-6 border-gray-200" />;

      default:
        console.warn("Unknown field type:", field.type);
        return (
          <div key={field.id} className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">Field type "{field.type}" is not supported yet</p>
          </div>
        );
    }
  };

  if (event.status === "closed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Closed</h1>
          <p className="text-gray-600">This event is no longer accepting RSVPs.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your RSVP has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  if (event.settings.invitationCode && !codeVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Enter Invitation Code</h1>
          <form onSubmit={handleCodeSubmit}>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="Enter your invitation code"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
            />
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: safeColors.background }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8" style={{ backgroundColor: safeColors.card }}>
          {event.cover_image_url && (
            <img
              src={event.cover_image_url}
              alt={event.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-3xl font-bold mb-2" style={{ color: safeColors.primary, fontFamily: safeTypography.headingFont }}>
            {event.name}
          </h1>

          {event.description && (
            <p className="text-gray-600 mb-6" style={{ color: safeColors.muted, fontFamily: safeTypography.bodyFont }}>
              {event.description}
            </p>
          )}

          <div className="space-y-3 mb-8 text-sm" style={{ color: safeColors.text }}>
            {event.event_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
            )}
            {event.start_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{event.start_time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
            {event.contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${event.contact_email}`} className="text-blue-600 hover:underline">
                  {event.contact_email}
                </a>
              </div>
            )}
            {event.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href={`tel:${event.contact_phone}`} className="text-blue-600 hover:underline">
                  {event.contact_phone}
                </a>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {schema.sections.map((section) => (
              <div key={section.id} className="mb-8">
                {section.title && (
                  <h2 className="text-xl font-semibold mb-4" style={{ color: safeColors.primary }}>
                    {section.title}
                  </h2>
                )}
                {section.description && (
                  <p className="text-gray-600 mb-4" style={{ color: safeColors.muted }}>
                    {section.description}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => renderField(field))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: safeColors.button,
                color: safeColors.buttonText,
              }}
            >
              {loading ? "Submitting..." : "Submit RSVP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
