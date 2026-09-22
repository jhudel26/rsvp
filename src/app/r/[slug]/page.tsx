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

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  console.log("Event data:", event);
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

  if (!event) {
    console.log("Event not found for slug:", params.slug);
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

  return <RSVPForm event={event as EventRecord} />;
}
