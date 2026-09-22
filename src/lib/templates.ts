import { createField, defaultEventSchema } from "@/lib/forms/catalog";
import type { FormSchema } from "@/types/forms";
import type { ThemePresetId } from "@/types/theme";
import { uid } from "@/lib/utils";

export interface TemplateSeed {
  key: string;
  name: string;
  description: string;
  category: string;
  theme_preset: ThemePresetId;
  schema: FormSchema;
}

function section(title: string, fields: FormSchema["sections"][number]["fields"], description = "") {
  return { id: uid("sec"), title, description, fields };
}

export const SYSTEM_TEMPLATES: TemplateSeed[] = [
  {
    key: "wedding",
    name: "Wedding RSVP",
    description: "Classic wedding response with attendance, guests, meals, and a note.",
    category: "Wedding",
    theme_preset: "wedding",
    schema: defaultEventSchema(),
  },
  {
    key: "birthday",
    name: "Birthday RSVP",
    description: "Name, attendance, plus-one, and gift notes.",
    category: "Birthday",
    theme_preset: "birthday",
    schema: {
      sections: [
        section("Guest", [createField("short_text", { label: "Full name", required: true }), createField("email")]),
        section("Attendance", [
          createField("attendance"),
          createField("yes_no", { label: "Bringing a plus-one?" }),
          createField("short_text", { label: "Plus-one name" }),
        ]),
        section("Notes", [createField("long_text", { label: "Message for the birthday guest" })]),
      ],
    },
  },
  {
    key: "christmas",
    name: "Christmas Party RSVP",
    description: "Festive gathering with dish assignment and arrival time.",
    category: "Holiday",
    theme_preset: "christmas",
    schema: {
      sections: [
        section("Guest", [createField("short_text", { label: "Full name", required: true }), createField("email")]),
        section("Attendance", [createField("attendance"), createField("guest_count"), createField("time", { label: "Estimated arrival" })]),
        section("Potluck", [createField("short_text", { label: "Dish you will bring" }), createField("dietary")]),
      ],
    },
  },
  {
    key: "halloween",
    name: "Halloween Party RSVP",
    description: "Costume party details and plus-ones.",
    category: "Holiday",
    theme_preset: "halloween",
    schema: {
      sections: [
        section("Guest", [createField("short_text", { label: "Full name", required: true })]),
        section("Party", [
          createField("attendance", {
            options: [
              { id: "yes", label: "I’ll be there", value: "attending" },
              { id: "maybe", label: "Might haunt later", value: "maybe" },
              { id: "no", label: "Cannot make it", value: "not_attending" },
            ],
          }),
          createField("short_text", { label: "Costume type" }),
          createField("dropdown", {
            label: "Favorite Halloween movie",
            options: [
              { id: "hocus", label: "Hocus Pocus", value: "hocus" },
              { id: "beetle", label: "Beetlejuice", value: "beetle" },
              { id: "scream", label: "Scream", value: "scream" },
              { id: "other", label: "Other", value: "other" },
            ],
          }),
          createField("yes_no", { label: "Bringing a friend?" }),
          createField("long_text", { label: "Message" }),
        ]),
      ],
    },
  },
  {
    key: "corporate",
    name: "Corporate Event RSVP",
    description: "Professional seminar registration with workshops.",
    category: "Corporate",
    theme_preset: "corporate",
    schema: {
      sections: [
        section("Attendee", [
          createField("short_text", { label: "Full name", required: true }),
          createField("short_text", { label: "Company", required: true }),
          createField("short_text", { label: "Position" }),
          createField("email"),
        ]),
        section("Session", [
          createField("attendance"),
          createField("checkbox", {
            label: "Workshop selection",
            options: [
              { id: "a", label: "Morning keynote", value: "keynote" },
              { id: "b", label: "Strategy workshop", value: "strategy" },
              { id: "c", label: "Networking lunch", value: "lunch" },
            ],
          }),
          createField("dietary"),
        ]),
      ],
    },
  },
  {
    key: "graduation",
    name: "Graduation RSVP",
    description: "Ceremony attendance and guest count.",
    category: "Graduation",
    theme_preset: "graduation",
    schema: {
      sections: [
        section("Guest", [createField("short_text", { label: "Full name", required: true }), createField("email"), createField("phone")]),
        section("Ceremony", [createField("attendance"), createField("guest_count"), createField("long_text", { label: "Congratulatory note" })]),
      ],
    },
  },
  {
    key: "baby",
    name: "Baby Shower RSVP",
    description: "Registry notes, attendance, and gift coordination.",
    category: "Baby Shower",
    theme_preset: "baby_shower",
    schema: {
      sections: [
        section("Guest", [createField("short_text", { label: "Full name", required: true }), createField("email")]),
        section("Celebration", [
          createField("attendance"),
          createField("yes_no", { label: "Need the address sent privately?" }),
          createField("short_text", { label: "Gift you plan to bring (optional)" }),
          createField("long_text", { label: "Note for the parents" }),
        ]),
      ],
    },
  },
  {
    key: "anniversary",
    name: "Anniversary RSVP",
    description: "Elegant dinner attendance with meal choices.",
    category: "Anniversary",
    theme_preset: "anniversary",
    schema: {
      sections: [
        section("Guest", [createField("short_text", { label: "Full name", required: true }), createField("email")]),
        section("Dinner", [createField("attendance"), createField("guest_count"), createField("meal"), createField("dietary"), createField("long_text", { label: "A memory to share" })]),
      ],
    },
  },
  {
    key: "party",
    name: "General Party RSVP",
    description: "Flexible party response for any gathering.",
    category: "Party",
    theme_preset: "party",
    schema: {
      sections: [
        section("Guest", [createField("short_text", { label: "Full name", required: true }), createField("email"), createField("phone")]),
        section("Details", [createField("attendance"), createField("guest_count"), createField("long_text", { label: "Anything we should know?" })]),
      ],
    },
  },
];
