import type { FormField, FormSchema, ResponseAnswers } from "@/types/forms";
import { flattenFields, isLayoutField } from "@/lib/forms/catalog";
import type { FormResponse } from "@/types/events";

export function buildFieldAnalytics(schema: FormSchema, responses: FormResponse[]) {
  const fields = flattenFields(schema).filter((field) => !isLayoutField(field.type));
  return fields.map((field) => ({
    field,
    breakdown: summarizeField(field, responses.map((row) => row.answers)),
  }));
}

function summarizeField(field: FormField, answers: ResponseAnswers[]) {
  const counts = new Map<string, number>();
  let numericTotal = 0;
  let numericCount = 0;

  for (const answer of answers) {
    const value = answer[field.id];
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((item) => counts.set(String(item), (counts.get(String(item)) ?? 0) + 1));
      continue;
    }
    if (typeof value === "number" || field.type === "guest_count" || field.type === "number" || field.type === "rating") {
      const n = Number(value);
      if (!Number.isNaN(n)) {
        numericTotal += n;
        numericCount += 1;
      }
    }
    counts.set(String(value), (counts.get(String(value)) ?? 0) + 1);
  }

  return {
    counts: Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value),
    average: numericCount ? numericTotal / numericCount : null,
    sum: numericCount ? numericTotal : null,
  };
}

export function attendanceSummary(responses: FormResponse[]) {
  const attending = responses.filter((r) => r.attendance === "attending").length;
  const notAttending = responses.filter((r) => r.attendance === "not_attending").length;
  const maybe = responses.filter((r) => r.attendance === "maybe").length;
  const pending = responses.filter((r) => r.attendance === "unknown").length;
  const guestCount = responses.reduce((sum, row) => sum + (row.guest_count || 0), 0);
  return { attending, notAttending, maybe, pending, guestCount, total: responses.length };
}
