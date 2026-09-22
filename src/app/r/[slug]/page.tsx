import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RSVPForm from "./rsvp-form";
import type { EventRecord } from "@/types/events";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function PublicRSVPPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  console.log("Fetching event for slug:", slug);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid URL</h1>
          <p className="text-gray-600">No event slug provided in the URL.</p>
        </div>
      </div>
    );
  }

  // First, try to find the event regardless of status to see if it exists
  const { data: anyEvent, error: anyError } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .limit(1);

  console.log("Any event with this slug:", anyEvent);
  console.log("Any error:", anyError);

  if (anyEvent && anyEvent.length > 0) {
    const event = anyEvent[0] as any;
    if (event.status !== "published") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Published</h1>
            <p className="text-gray-600 mb-4">This event exists but has not been published yet.</p>
            <p className="text-sm text-gray-500">Current status: <strong>{event.status}</strong></p>
            <p className="text-sm text-gray-500">Event: {event.name}</p>
          </div>
        </div>
      );
    }
  }

  // Now try to find published event
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published");

  console.log("Published events data:", events);
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
    console.log("No published events found for slug:", slug);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find the event you're looking for. It may have been moved or deleted.</p>
          <p className="text-sm text-gray-500">Slug: {slug}</p>
          <p className="text-xs text-gray-400 mt-2">Note: Make sure the event is published and the slug matches the URL</p>
          <p className="text-xs text-gray-400 mt-2">Check available events at <a href="/debug-events" className="text-blue-600 hover:underline">/debug-events</a></p>
        </div>
      </div>
    );
  }

  const event = events[0];
  console.log("Found event:", event);

  // Only render RSVPForm if event exists
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600">Event data is invalid.</p>
        </div>
      </div>
    );
  }

  return <RSVPForm event={event as EventRecord} />;
}
