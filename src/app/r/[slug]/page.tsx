import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RSVPForm from "./rsvp-form";
import type { EventRecord } from "@/types/events";

interface PageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export default async function PublicRSVPPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (error || !event) {
    notFound();
  }

  return <RSVPForm event={event as EventRecord} />;
}
