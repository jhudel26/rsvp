import type { ActivityLog, EventRecord, FormResponse, Profile } from "./events";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      events: {
        Row: EventRecord;
        Insert: Partial<EventRecord> & { user_id: string; name: string; slug: string };
        Update: Partial<EventRecord>;
      };
      form_responses: {
        Row: FormResponse;
        Insert: Partial<FormResponse> & { event_id: string };
        Update: Partial<FormResponse>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Partial<ActivityLog> & { action: string };
        Update: Partial<ActivityLog>;
      };
    };
  };
}
