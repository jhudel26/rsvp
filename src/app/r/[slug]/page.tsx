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

  console.log("Fetching event for slug:", params.slug);

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published");

  console.log("Events data:", events);
  console.log("Error:", error);

  if (error) {
    console.error("Error fetching event:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find the event you're looking for. It may have been moved or deleted.</p>
          <p className="text-sm text-gray-500">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    console.log("No events found for slug:", params.slug);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find the event you're looking for. It may have been moved or deleted.</p>
          <p className="text-sm text-gray-500">Slug: {params.slug}</p>
        </div>
      </div>
    );
  }

  const event = events[0];
  console.log("Found event:", event);

  return <RSVPForm event={event as EventRecord} />;
}
