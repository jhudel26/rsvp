import type { FormSchema, ResponseAnswers } from "./forms";
import type { BrandingAssets, ThemeConfig, ThemePresetId } from "./theme";

export type EventStatus = "draft" | "published" | "closed" | "archived";

export interface EventSettings {
  rsvpDeadline?: string | null;
  allowMultipleSubmissions: boolean;
  requireEmail: boolean;
  maxGuests?: number | null;
  allowEditResponse: boolean;
  notifyOnSubmit: boolean;
  notificationEmail?: string | null;
  isPrivate: boolean;
  requireInvitationCode: boolean;
  invitationCode?: string | null;
  confirmationTitle: string;
  confirmationMessage: string;
  closedMessage: string;
}

export interface EventRecord {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  address: string | null;
  maps_url: string | null;
  cover_image_url: string | null;
  host_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: EventStatus;
  theme_preset: ThemePresetId;
  form_schema: FormSchema;
  theme_config: ThemeConfig;
  settings: EventSettings;
  branding: BrandingAssets;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export type EventInsert = Omit<EventRecord, "id" | "created_at" | "updated_at" | "published_at"> & {
  id?: string;
};

export interface FormResponse {
  id: string;
  event_id: string;
  answers: ResponseAnswers;
  guest_name: string | null;
  guest_email: string | null;
  attendance: "attending" | "not_attending" | "maybe" | "unknown";
  guest_count: number;
  status: "submitted" | "updated" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  event_id: string | null;
  action: string;
  detail: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
