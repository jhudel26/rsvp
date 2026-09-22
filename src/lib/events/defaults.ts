import { defaultEventSchema } from "@/lib/forms/catalog";
import { cloneTheme } from "@/lib/themes/presets";
import type { EventSettings } from "@/types/events";
import type { FormSchema } from "@/types/forms";
import type { ThemePresetId } from "@/types/theme";

export function defaultSettings(): EventSettings {
  return {
    rsvpDeadline: null,
    allowMultipleSubmissions: false,
    requireEmail: true,
    maxGuests: 10,
    allowEditResponse: false,
    notifyOnSubmit: false,
    notificationEmail: null,
    isPrivate: false,
    requireInvitationCode: false,
    invitationCode: null,
    confirmationTitle: "Thank you",
    confirmationMessage: "Your RSVP has been received. We look forward to celebrating with you.",
    closedMessage: "RSVPs for this event are now closed.",
  };
}

export function newEventDefaults(name = "Untitled event", slug = "untitled-event") {
  return {
    name,
    slug,
    description: "",
    event_date: null as string | null,
    start_time: null as string | null,
    end_time: null as string | null,
    location: "",
    address: "",
    maps_url: "",
    cover_image_url: null as string | null,
    host_name: "",
    contact_email: "",
    contact_phone: "",
    status: "draft" as const,
    theme_preset: "wedding" as ThemePresetId,
    form_schema: defaultEventSchema() as FormSchema,
    theme_config: cloneTheme("wedding"),
    settings: defaultSettings(),
    branding: {},
  };
}
