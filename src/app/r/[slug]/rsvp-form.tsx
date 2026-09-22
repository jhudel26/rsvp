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

  const schema: FormSchema = event.form_schema;
  const fields = flattenFields(schema);

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
    if (!isFieldVisible(field, schema, answers)) return null;

    const error = errors[field.id];

    switch (field.type) {
      case "short_text":
      case "email":
      case "phone":
        return (
          <div key={field.id} className={`mb-4 ${field.width === "half" ? "w-1/2 pr-2" : field.width === "third" ? "w-1/3 pr-2" : "w-full"}`}>
            <label className="block text-sm font-medium mb-2" style={{ color: event.theme_config.colors.text }}>
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
                borderColor: error ? event.theme_config.colors.button : "#e5e7eb",
                backgroundColor: event.theme_config.colors.card,
                color: event.theme_config.colors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "long_text":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: event.theme_config.colors.text }}>
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
                borderColor: error ? event.theme_config.colors.button : "#e5e7eb",
                backgroundColor: event.theme_config.colors.card,
                color: event.theme_config.colors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "number":
      case "guest_count":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: event.theme_config.colors.text }}>
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
                borderColor: error ? event.theme_config.colors.button : "#e5e7eb",
                backgroundColor: event.theme_config.colors.card,
                color: event.theme_config.colors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "radio":
      case "dropdown":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: event.theme_config.colors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === "dropdown" ? (
              <select
                value={answers[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                style={{
                  borderColor: error ? event.theme_config.colors.button : "#e5e7eb",
                  backgroundColor: event.theme_config.colors.card,
                  color: event.theme_config.colors.text,
                }}
              >
                <option value="">Select an option</option>
                {field.options?.map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
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
                    <span style={{ color: event.theme_config.colors.text }}>{option.label}</span>
                  </label>
                ))}
              </div>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: event.theme_config.colors.text }}>
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
                  <span style={{ color: event.theme_config.colors.text }}>{option.label}</span>
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
            <label className="block text-sm font-medium mb-2" style={{ color: event.theme_config.colors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-4">
              {field.options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleFieldChange(field.id, option.value)}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    answers[field.id] === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  style={{
                    backgroundColor: answers[field.id] === option.value ? event.theme_config.colors.primary : event.theme_config.colors.card,
                    color: answers[field.id] === option.value ? event.theme_config.colors.buttonText : event.theme_config.colors.text,
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
            <label className="block text-sm font-medium mb-2" style={{ color: event.theme_config.colors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={answers[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                borderColor: error ? event.theme_config.colors.button : "#e5e7eb",
                backgroundColor: event.theme_config.colors.card,
                color: event.theme_config.colors.text,
              }}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case "time":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: event.theme_config.colors.text }}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="time"
              value={answers[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                borderColor: error ? event.theme_config.colors.button : "#e5e7eb",
                backgroundColor: event.theme_config.colors.card,
                color: event.theme_config.colors.text,
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
                color: event.theme_config.colors.primary,
                fontFamily: event.theme_config.typography.headingFont,
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
                color: event.theme_config.colors.muted,
                fontFamily: event.theme_config.typography.bodyFont,
              }}
            >
              {field.content}
            </p>
          </div>
        );

      case "divider":
        return <hr key={field.id} className="my-6 border-gray-200" />;

      default:
        return null;
    }
  };

  if (event.status === "closed") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: event.theme_config.colors.background }}>
        <div
          className="max-w-md w-full p-8 rounded-xl text-center"
          style={{
            backgroundColor: event.theme_config.colors.card,
            fontFamily: event.theme_config.typography.bodyFont,
          }}
        >
          <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: event.theme_config.colors.button }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: event.theme_config.colors.text }}>
            RSVPs Closed
          </h2>
          <p style={{ color: event.theme_config.colors.muted }}>{event.settings.closedMessage}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: event.theme_config.colors.background }}>
        <div
          className="max-w-md w-full p-8 rounded-xl text-center"
          style={{
            backgroundColor: event.theme_config.colors.card,
            fontFamily: event.theme_config.typography.bodyFont,
          }}
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: event.theme_config.colors.button }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: event.theme_config.colors.text }}>
            {event.settings.confirmationTitle}
          </h2>
          <p className="mb-6" style={{ color: event.theme_config.colors.muted }}>
            {event.settings.confirmationMessage}
          </p>
        </div>
      </div>
    );
  }

  if (event.settings.requireInvitationCode && !codeVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: event.theme_config.colors.background }}>
        <div
          className="max-w-md w-full p-8 rounded-xl"
          style={{
            backgroundColor: event.theme_config.colors.card,
            fontFamily: event.theme_config.typography.bodyFont,
          }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: event.theme_config.colors.text }}>
            Enter Invitation Code
          </h2>
          <form onSubmit={handleCodeSubmit}>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="Enter your invitation code"
              className="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              style={{
                backgroundColor: event.theme_config.colors.card,
                color: event.theme_config.colors.text,
              }}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-medium text-white"
              style={{
                backgroundColor: event.theme_config.colors.button,
                borderRadius: `${event.theme_config.buttonStyle.radius}px`,
              }}
            >
              Verify Code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor:
          event.theme_config.background.type === "gradient"
            ? `linear-gradient(135deg, ${event.theme_config.background.value} 0%, ${event.theme_config.background.secondary || event.theme_config.background.value} 100%)`
            : event.theme_config.background.value,
        fontFamily: event.theme_config.typography.bodyFont,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-xl shadow-lg p-8 mb-8"
          style={{
            backgroundColor: event.theme_config.colors.card,
            borderRadius: `${event.theme_config.cardStyle.radius}px`,
          }}
        >
          <h1
            className="text-4xl font-bold mb-4"
            style={{
              color: event.theme_config.colors.primary,
              fontFamily: event.theme_config.typography.headingFont,
              fontWeight: event.theme_config.typography.headingWeight,
            }}
          >
            {event.name}
          </h1>

          {event.description && (
            <p className="mb-6 text-lg" style={{ color: event.theme_config.colors.muted }}>
              {event.description}
            </p>
          )}

          <div className="space-y-3 mb-6">
            {event.event_date && (
              <div className="flex items-center gap-2" style={{ color: event.theme_config.colors.text }}>
                <Calendar className="w-5 h-5" style={{ color: event.theme_config.colors.primary }} />
                <span>{new Date(event.event_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            )}

            {event.start_time && (
              <div className="flex items-center gap-2" style={{ color: event.theme_config.colors.text }}>
                <Clock className="w-5 h-5" style={{ color: event.theme_config.colors.primary }} />
                <span>
                  {event.start_time}
                  {event.end_time && ` - ${event.end_time}`}
                </span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2" style={{ color: event.theme_config.colors.text }}>
                <MapPin className="w-5 h-5" style={{ color: event.theme_config.colors.primary }} />
                <span>{event.location}</span>
              </div>
            )}

            {event.address && (
              <div className="flex items-center gap-2" style={{ color: event.theme_config.colors.muted }}>
                <span className="ml-7">{event.address}</span>
              </div>
            )}

            {event.host_name && (
              <div className="flex items-center gap-2" style={{ color: event.theme_config.colors.text }}>
                <span className="ml-7">Hosted by {event.host_name}</span>
              </div>
            )}
          </div>

          {event.maps_url && (
            <a
              href={event.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium mb-6"
              style={{ color: event.theme_config.colors.primary }}
            >
              <MapPin className="w-4 h-4" />
              View on Google Maps
            </a>
          )}
        </div>

        <div
          className="rounded-xl shadow-lg p-8"
          style={{
            backgroundColor: event.theme_config.colors.card,
            borderRadius: `${event.theme_config.cardStyle.radius}px`,
          }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{
              color: event.theme_config.colors.primary,
              fontFamily: event.theme_config.typography.headingFont,
            }}
          >
            RSVP
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap">
              {fields.map((field) => renderField(field))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-lg font-medium text-white text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: event.theme_config.colors.button,
                borderRadius: `${event.theme_config.buttonStyle.radius}px`,
              }}
            >
              {loading ? "Submitting..." : "Submit RSVP"}
            </button>
          </form>
        </div>

        {event.contact_email && (
          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: event.theme_config.colors.muted }}>
              Questions? Contact{" "}
              <a href={`mailto:${event.contact_email}`} className="font-medium" style={{ color: event.theme_config.colors.primary }}>
                {event.contact_email}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
