import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DebugEventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(10);

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug: Events Error</h1>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug: Recent Events</h1>
      <div className="space-y-4">
        {events?.map((event: any) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-4 border">
            <h2 className="font-bold">{event.name}</h2>
            <p><strong>Slug:</strong> {event.slug}</p>
            <p><strong>Status:</strong> {event.status}</p>
            <p><strong>Created:</strong> {event.created_at}</p>
            <p><strong>Public URL:</strong> <a href={`/r/${event.slug}`} className="text-blue-600 hover:underline">/r/{event.slug}</a></p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
