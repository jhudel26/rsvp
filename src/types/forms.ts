export const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "radio",
  "checkbox",
  "dropdown",
  "yes_no",
  "maybe",
  "date",
  "time",
  "datetime",
  "attendance",
  "guest_count",
  "guest_names",
  "meal",
  "dietary",
  "transportation",
  "accommodation",
  "table_preference",
  "file",
  "signature",
  "rating",
  "divider",
  "heading",
  "paragraph",
  "image",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type ConditionOperator =
  | "eq"
  | "neq"
  | "contains"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "empty"
  | "not_empty";

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FieldCondition {
  id: string;
  fieldId: string;
  operator: ConditionOperator;
  value: string;
}

export interface VisibilityRule {
  logic: "and" | "or";
  conditions: FieldCondition[];
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  validation?: {
    pattern?: string;
    message?: string;
  };
  visibility?: VisibilityRule;
  width: "full" | "half" | "third";
  content?: string;
  src?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormSchema {
  sections: FormSection[];
}

export type AnswerValue = string | string[] | number | boolean | null;

export type ResponseAnswers = Record<string, AnswerValue>;
