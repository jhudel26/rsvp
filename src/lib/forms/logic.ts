import type { AnswerValue, FormField, FormSchema, ResponseAnswers, VisibilityRule } from "@/types/forms";
import { flattenFields, isLayoutField } from "@/lib/forms/catalog";

function toNumber(value: AnswerValue) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

export function evaluateCondition(field: FormField | undefined, answers: ResponseAnswers, operator: VisibilityRule["conditions"][number]["operator"], expected: string) {
  const actual = field ? answers[field.id] : undefined;
  switch (operator) {
    case "empty":
      return actual === undefined || actual === null || actual === "" || (Array.isArray(actual) && actual.length === 0);
    case "not_empty":
      return !(actual === undefined || actual === null || actual === "" || (Array.isArray(actual) && actual.length === 0));
    case "eq":
      if (Array.isArray(actual)) return actual.includes(expected);
      return String(actual ?? "") === expected;
    case "neq":
      if (Array.isArray(actual)) return !actual.includes(expected);
      return String(actual ?? "") !== expected;
    case "contains":
      if (Array.isArray(actual)) return actual.some((item) => String(item).toLowerCase().includes(expected.toLowerCase()));
      return String(actual ?? "").toLowerCase().includes(expected.toLowerCase());
    case "gt":
      return toNumber(actual ?? null) > Number(expected);
    case "lt":
      return toNumber(actual ?? null) < Number(expected);
    case "gte":
      return toNumber(actual ?? null) >= Number(expected);
    case "lte":
      return toNumber(actual ?? null) <= Number(expected);
    default:
      return true;
  }
}

export function isFieldVisible(field: FormField, schema: FormSchema, answers: ResponseAnswers) {
  if (!field.visibility || field.visibility.conditions.length === 0) return true;
  const results = field.visibility.conditions.map((condition) => {
    const target = flattenFields(schema).find((item) => item.id === condition.fieldId);
    return evaluateCondition(target, answers, condition.operator, condition.value);
  });
  return field.visibility.logic === "or" ? results.some(Boolean) : results.every(Boolean);
}

export function validateField(field: FormField, value: AnswerValue): string | null {
  if (isLayoutField(field.type)) return null;
  const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  if (field.required && empty) return "This field is required.";
  if (empty) return null;
  if (field.type === "email") {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
    if (!ok) return "Enter a valid email address.";
  }
  if (field.type === "phone") {
    const ok = String(value).replace(/[^\d+]/g, "").length >= 7;
    if (!ok) return "Enter a valid phone number.";
  }
  if (field.type === "number" || field.type === "guest_count" || field.type === "rating") {
    const n = toNumber(value);
    if (Number.isNaN(n)) return "Enter a number.";
    if (field.min !== undefined && n < field.min) return `Must be at least ${field.min}.`;
    if (field.max !== undefined && n > field.max) return `Must be at most ${field.max}.`;
  }
  if (field.validation?.pattern) {
    try {
      const re = new RegExp(field.validation.pattern);
      if (!re.test(String(value))) return field.validation.message || "Invalid value.";
    } catch {
      return null;
    }
  }
  return null;
}

export function validateSchema(schema: FormSchema, answers: ResponseAnswers, requireEmail: boolean) {
  const errors: Record<string, string> = {};
  for (const field of flattenFields(schema)) {
    if (!isFieldVisible(field, schema, answers)) continue;
    const message = validateField(field, answers[field.id] ?? null);
    if (message) errors[field.id] = message;
    if (requireEmail && field.type === "email" && !answers[field.id]) {
      errors[field.id] = "Email is required.";
    }
  }
  return errors;
}

export function extractGuestMeta(schema: FormSchema, answers: ResponseAnswers) {
  const fields = flattenFields(schema);
  const nameField = fields.find((f) => /name/i.test(f.label) && (f.type === "short_text" || f.type === "long_text"));
  const emailField = fields.find((f) => f.type === "email");
  const attendanceField = fields.find((f) => f.type === "attendance" || /attend/i.test(f.label));
  const countField = fields.find((f) => f.type === "guest_count");

  const rawAttendance = attendanceField ? String(answers[attendanceField.id] ?? "") : "";
  let attendance: "attending" | "not_attending" | "maybe" | "unknown" = "unknown";
  if (["attending", "yes", "true"].includes(rawAttendance)) attendance = "attending";
  else if (["not_attending", "no", "false"].includes(rawAttendance)) attendance = "not_attending";
  else if (["maybe"].includes(rawAttendance)) attendance = "maybe";

  const count = countField ? Number(answers[countField.id] ?? 0) : attendance === "attending" ? 1 : 0;

  return {
    guest_name: nameField ? String(answers[nameField.id] ?? "") || null : null,
    guest_email: emailField ? String(answers[emailField.id] ?? "") || null : null,
    attendance,
    guest_count: Number.isFinite(count) ? count : 0,
  };
}
