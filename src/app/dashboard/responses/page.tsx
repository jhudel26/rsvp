"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Download, Search, Filter, Eye, Trash2, Mail } from "lucide-react";
import { exportResponses } from "@/lib/export";

export const dynamic = "force-dynamic";

interface Response {
  id: string;
  event_id: string;
  answers: Record<string, any>;
  guest_name: string | null;
  guest_email: string | null;
  attendance: "attending" | "not_attending" | "maybe" | "unknown";
  guest_count: number;
  status: "submitted" | "updated" | "cancelled";
  created_at: string;
  event: {
    name: string;
  };
}

export default function AllResponsesPage() {
  const supabase = createClient();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const loadResponses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("form_responses")
        .select("*, events(name)")
        .eq("events.user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading responses:", error);
      } else {
        setResponses((data as Response[]) || []);
      }

      setLoading(false);
    };

    loadResponses();
  }, [supabase]);

  const handleDelete = async (responseId: string) => {
    if (!confirm("Are you sure you want to delete this response?")) {
      return;
    }

    const { error } = await supabase.from("form_responses").delete().eq("id", responseId);

    if (error) {
      console.error("Error deleting response:", error);
      alert("Failed to delete response");
    } else {
      setResponses(responses.filter((r) => r.id !== responseId));
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    const filtered = filteredResponses();
    await exportResponses(filtered, format, "all-responses");
  };

  const filteredResponses = () => {
    return responses.filter((response) => {
      const matchesSearch =
        searchTerm === "" ||
        response.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.event?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterStatus === "all" || response.attendance === filterStatus;

      return matchesSearch && matchesFilter;
    });
  };

  const attendanceColors = {
    attending: "bg-green-100 text-green-700",
    not_attending: "bg-red-100 text-red-700",
    maybe: "bg-yellow-100 text-yellow-700",
    unknown: "bg-gray-100 text-gray-700",
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading responses...</div>
        </div>
      </DashboardLayout>
    );
  }

  const filtered = filteredResponses();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Responses</h1>
            <p className="text-gray-600 text-sm">{filtered.length} total responses across all events</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="attending">Attending</option>
              <option value="not_attending">Not Attending</option>
              <option value="maybe">Maybe</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <p className="text-gray-600">No responses found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((response) => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{response.event?.name || "Unknown"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{response.guest_name || "Anonymous"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{response.guest_email || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${attendanceColors[response.attendance]}`}>
                        {response.attendance}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{response.guest_count}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{format(new Date(response.created_at), "MMM d, yyyy")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const answersJson = JSON.stringify(response.answers, null, 2);
                            alert(`Full Response:\n\n${answersJson}`);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {response.guest_email && (
                          <a
                            href={`mailto:${response.guest_email}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Send email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(response.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
