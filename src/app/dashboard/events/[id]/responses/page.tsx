"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Search, Filter, Eye, Trash2, Mail } from "lucide-react";
import { format } from "date-fns";
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
}

export default function ResponsesPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadResponses = async () => {
      const { data, error } = await supabase
        .from("form_responses")
        .select("*")
        .eq("event_id", params.id as string)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading responses:", error);
      } else {
        setResponses((data as Response[]) || []);
      }

      setLoading(false);
    };

    loadResponses();
  }, [supabase, params.id]);

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
    await exportResponses(filtered, format, params.id as string);
  };

  const filteredResponses = () => {
    return responses.filter((response) => {
      const matchesSearch =
        searchTerm === "" ||
        response.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.guest_email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterStatus === "all" || response.attendance === filterStatus;

      return matchesSearch && matchesFilter;
    });
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedResponses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResponses(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedResponses.size === filteredResponses().length) {
      setSelectedResponses(new Set());
    } else {
      setSelectedResponses(new Set(filteredResponses().map((r) => r.id)));
    }
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
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/events/${params.id}`} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Responses</h1>
              <p className="text-gray-600 text-sm">{filtered.length} total responses</p>
            </div>
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
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedResponses.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
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
                      <input
                        type="checkbox"
                        checked={selectedResponses.has(response.id)}
                        onChange={() => toggleSelect(response.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
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
