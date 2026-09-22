import type { FormField, FormSchema, ResponseAnswers } from "@/types/forms";
import { flattenFields, isLayoutField } from "@/lib/forms/catalog";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function stringifyAnswer(value: ResponseAnswers[string]) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

export function responsesToCsv(fields: FormField[], rows: { answers: ResponseAnswers; created_at: string; guest_name: string | null; guest_email: string | null; attendance: string; guest_count: number }[]) {
  const inputFields = fields.filter((field) => !isLayoutField(field.type));
  const headers = ["Submitted", "Guest", "Email", "Attendance", "Guests", ...inputFields.map((field) => field.label)];
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    const cells = [
      row.created_at,
      row.guest_name ?? "",
      row.guest_email ?? "",
      row.attendance,
      String(row.guest_count),
      ...inputFields.map((field) => stringifyAnswer(row.answers[field.id])),
    ];
    lines.push(cells.map(csvEscape).join(","));
  }
  return lines.join("\n");
}

export function responsesToJson(schema: FormSchema, rows: unknown[]) {
  return JSON.stringify({ schema, responses: rows }, null, 2);
}

export async function exportResponses(responses: any[], format: "csv" | "json", eventId: string) {
  if (format === "json") {
    const data = JSON.stringify(responses, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-responses-${eventId}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else if (format === "csv") {
    const headers = ["ID", "Guest Name", "Guest Email", "Attendance", "Guest Count", "Status", "Submitted At"];
    const rows = responses.map((r) => [
      r.id,
      r.guest_name || "",
      r.guest_email || "",
      r.attendance,
      r.guest_count,
      r.status,
      r.created_at,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-responses-${eventId}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export function flattenEventFields(schema: FormSchema) {
  return flattenFields(schema).filter((field) => !isLayoutField(field.type));
}
