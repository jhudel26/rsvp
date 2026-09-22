import type { FieldType, FormField, FormSchema } from "@/types/forms";
import { uid } from "@/lib/utils";

export interface FieldCatalogItem {
  type: FieldType;
  label: string;
  group: "Basic" | "Choice" | "Date & Time" | "RSVP" | "Advanced" | "Layout";
  description: string;
}

export const FIELD_CATALOG: FieldCatalogItem[] = [
  { type: "short_text", label: "Short Text", group: "Basic", description: "Single-line answer" },
  { type: "long_text", label: "Long Text", group: "Basic", description: "Paragraph answer" },
  { type: "email", label: "Email", group: "Basic", description: "Email address" },
  { type: "phone", label: "Phone", group: "Basic", description: "Phone number" },
  { type: "number", label: "Number", group: "Basic", description: "Numeric value" },
  { type: "radio", label: "Radio Buttons", group: "Choice", description: "Choose one option" },
  { type: "checkbox", label: "Checkboxes", group: "Choice", description: "Choose multiple" },
  { type: "dropdown", label: "Dropdown", group: "Choice", description: "Select from a list" },
  { type: "yes_no", label: "Yes / No", group: "Choice", description: "Binary choice" },
  { type: "maybe", label: "Maybe / Not Sure", group: "Choice", description: "Yes, no, or maybe" },
  { type: "date", label: "Date", group: "Date & Time", description: "Calendar date" },
  { type: "time", label: "Time", group: "Date & Time", description: "Time of day" },
  { type: "datetime", label: "Date + Time", group: "Date & Time", description: "Combined datetime" },
  { type: "attendance", label: "Attendance", group: "RSVP", description: "Will you attend?" },
  { type: "guest_count", label: "Number of Guests", group: "RSVP", description: "Party size" },
  { type: "guest_names", label: "Guest Names", group: "RSVP", description: "Additional guests" },
  { type: "meal", label: "Meal Selection", group: "RSVP", description: "Entrée preference" },
  { type: "dietary", label: "Dietary Restrictions", group: "RSVP", description: "Allergies and needs" },
  { type: "transportation", label: "Transportation", group: "RSVP", description: "Travel plans" },
  { type: "accommodation", label: "Accommodation", group: "RSVP", description: "Lodging needs" },
  { type: "table_preference", label: "Table Preference", group: "RSVP", description: "Seating notes" },
  { type: "file", label: "File Upload", group: "Advanced", description: "Attach a file" },
  { type: "signature", label: "Signature", group: "Advanced", description: "Drawn signature" },
  { type: "rating", label: "Rating", group: "Advanced", description: "Star rating" },
  { type: "heading", label: "Heading", group: "Layout", description: "Section heading" },
  { type: "paragraph", label: "Paragraph", group: "Layout", description: "Instructional text" },
  { type: "divider", label: "Divider", group: "Layout", description: "Visual separator" },
  { type: "image", label: "Image", group: "Layout", description: "Inline image" },
];

const OPTIONS = {
  yesNo: [
    { id: "yes", label: "Yes", value: "yes" },
    { id: "no", label: "No", value: "no" },
  ],
  maybe: [
    { id: "yes", label: "Yes", value: "yes" },
    { id: "maybe", label: "Maybe / Not sure", value: "maybe" },
    { id: "no", label: "No", value: "no" },
  ],
  attendance: [
    { id: "attending", label: "Yes, I will attend", value: "attending" },
    { id: "maybe", label: "I am not sure yet", value: "maybe" },
    { id: "not_attending", label: "Sorry, I cannot attend", value: "not_attending" },
  ],
  meal: [
    { id: "chicken", label: "Chicken", value: "chicken" },
    { id: "beef", label: "Beef", value: "beef" },
    { id: "fish", label: "Fish", value: "fish" },
    { id: "vegetarian", label: "Vegetarian", value: "vegetarian" },
  ],
  transport: [
    { id: "own", label: "I will drive", value: "own" },
    { id: "ride", label: "Need a ride", value: "ride" },
    { id: "transit", label: "Public transit", value: "transit" },
  ],
  stay: [
    { id: "none", label: "No lodging needed", value: "none" },
    { id: "hotel", label: "Hotel recommendation", value: "hotel" },
    { id: "host", label: "Staying with host", value: "host" },
  ],
};

export function isLayoutField(type: FieldType) {
  return type === "heading" || type === "paragraph" || type === "divider" || type === "image";
}

export function createField(type: FieldType, overrides?: Partial<FormField>): FormField {
  const catalog = FIELD_CATALOG.find((item) => item.type === type);
  const base: FormField = {
    id: uid("fld"),
    type,
    label: catalog?.label ?? "Field",
    required: false,
    width: "full",
  };

  switch (type) {
    case "short_text":
      return { ...base, placeholder: "Your answer", ...overrides };
    case "long_text":
      return { ...base, placeholder: "Write a message…", ...overrides };
    case "email":
      return { ...base, label: "Email", required: true, placeholder: "you@example.com", ...overrides };
    case "phone":
      return { ...base, placeholder: "Phone number", ...overrides };
    case "number":
    case "guest_count":
      return { ...base, min: 0, max: 20, defaultValue: "1", ...overrides };
    case "radio":
    case "dropdown":
      return {
        ...base,
        options: [
          { id: uid("opt"), label: "Option 1", value: "option_1" },
          { id: uid("opt"), label: "Option 2", value: "option_2" },
        ],
        ...overrides,
      };
    case "checkbox":
      return {
        ...base,
        options: [
          { id: uid("opt"), label: "Option A", value: "a" },
          { id: uid("opt"), label: "Option B", value: "b" },
        ],
        ...overrides,
      };
    case "yes_no":
      return { ...base, options: OPTIONS.yesNo, ...overrides };
    case "maybe":
      return { ...base, options: OPTIONS.maybe, ...overrides };
    case "attendance":
      return {
        ...base,
        label: "Will you attend?",
        required: true,
        options: OPTIONS.attendance,
        ...overrides,
      };
    case "meal":
      return { ...base, options: OPTIONS.meal, ...overrides };
    case "transportation":
      return { ...base, options: OPTIONS.transport, ...overrides };
    case "accommodation":
      return { ...base, options: OPTIONS.stay, ...overrides };
    case "guest_names":
      return { ...base, placeholder: "Names of additional guests", ...overrides };
    case "dietary":
      return { ...base, placeholder: "Allergies or dietary needs", ...overrides };
    case "table_preference":
      return { ...base, placeholder: "Anyone you would like to sit with", ...overrides };
    case "heading":
      return { ...base, label: "Section heading", required: false, ...overrides };
    case "paragraph":
      return { ...base, content: "Add supporting information for your guests.", required: false, ...overrides };
    case "rating":
      return { ...base, min: 1, max: 5, ...overrides };
    default:
      return { ...base, ...overrides };
  }
}

export function emptySchema(): FormSchema {
  return {
    sections: [
      {
        id: uid("sec"),
        title: "RSVP",
        description: "",
        fields: [],
      },
    ],
  };
}

export function defaultEventSchema(): FormSchema {
  const attendance = createField("attendance");
  const guests = createField("guest_count", {
    visibility: {
      logic: "and",
      conditions: [{ id: uid("c"), fieldId: attendance.id, operator: "eq", value: "attending" }],
    },
  });
  const names = createField("guest_names", {
    visibility: {
      logic: "and",
      conditions: [
        { id: uid("c"), fieldId: attendance.id, operator: "eq", value: "attending" },
        { id: uid("c"), fieldId: guests.id, operator: "gt", value: "1" },
      ],
    },
  });
  const note = createField("paragraph", {
    label: "We’ll miss you",
    content: "Thank you for letting us know. You will be missed.",
    visibility: {
      logic: "and",
      conditions: [{ id: uid("c"), fieldId: attendance.id, operator: "eq", value: "not_attending" }],
    },
  });

  return {
    sections: [
      {
        id: uid("sec"),
        title: "Your details",
        description: "Tell us who is responding.",
        fields: [createField("short_text", { label: "Full name", required: true, placeholder: "Full name" }), createField("email")],
      },
      {
        id: uid("sec"),
        title: "Attendance",
        fields: [attendance, guests, names, note],
      },
      {
        id: uid("sec"),
        title: "Message",
        fields: [createField("long_text", { label: "Note for the host", required: false })],
      },
    ],
  };
}

export function flattenFields(schema: FormSchema): FormField[] {
  return schema.sections.flatMap((section) => section.fields);
}

export function findField(schema: FormSchema, id: string) {
  return flattenFields(schema).find((field) => field.id === id);
}
