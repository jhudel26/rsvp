-- Seed system templates
-- Run this after creating the Supabase project to populate initial templates
-- This uses simplified JSON for the form schemas

-- Wedding RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'Wedding RSVP',
  'Classic wedding response with attendance, guests, meals, and a note.',
  'Wedding',
  '{"sections":[{"id":"sec1","title":"Your Details","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true},{"id":"f2","type":"email","label":"Email","required":true}]},{"id":"sec2","title":"Attendance","fields":[{"id":"f3","type":"attendance","label":"Will you attend?","required":true},{"id":"f4","type":"guest_count","label":"Number of Guests"},{"id":"f5","type":"meal","label":"Meal Preference"},{"id":"f6","type":"long_text","label":"Message for the couple"}]}]}',
  'wedding',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Birthday RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'Birthday RSVP',
  'Name, attendance, plus-one, and gift notes.',
  'Birthday',
  '{"sections":[{"id":"sec1","title":"Guest Info","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true},{"id":"f2","type":"email","label":"Email","required":true}]},{"id":"sec2","title":"Attendance","fields":[{"id":"f3","type":"attendance","label":"Will you attend?","required":true},{"id":"f4","type":"yes_no","label":"Bringing a plus-one?"},{"id":"f5","type":"short_text","label":"Plus-one name"},{"id":"f6","type":"long_text","label":"Birthday message"}]}]}',
  'birthday',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Christmas Party RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'Christmas Party RSVP',
  'Festive gathering with dish assignment and arrival time.',
  'Holiday',
  '{"sections":[{"id":"sec1","title":"Guest Info","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true},{"id":"f2","type":"email","label":"Email","required":true}]},{"id":"sec2","title":"Attendance","fields":[{"id":"f3","type":"attendance","label":"Will you attend?","required":true},{"id":"f4","type":"guest_count","label":"Number of guests"},{"id":"f5","type":"time","label":"Estimated arrival"}]},{"id":"sec3","title":"Potluck","fields":[{"id":"f6","type":"short_text","label":"Dish you will bring"},{"id":"f7","type":"dietary","label":"Dietary restrictions"}]}]}',
  'christmas',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Halloween Party RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'Halloween Party RSVP',
  'Costume party details and plus-ones.',
  'Holiday',
  '{"sections":[{"id":"sec1","title":"Guest Info","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true}]},{"id":"sec2","title":"Party Details","fields":[{"id":"f2","type":"attendance","label":"Will you attend?","required":true},{"id":"f3","type":"short_text","label":"Costume type"},{"id":"f4","type":"dropdown","label":"Favorite Halloween Movie","options":[{"id":"o1","label":"Hocus Pocus","value":"hocus"},{"id":"o2","label":"Beetlejuice","value":"beetle"},{"id":"o3","label":"Scream","value":"scream"}]},{"id":"f5","type":"yes_no","label":"Bringing a friend?"},{"id":"f6","type":"long_text","label":"Message"}]}]}',
  'halloween',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Corporate Event RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'Corporate Event RSVP',
  'Professional seminar registration with workshops.',
  'Corporate',
  '{"sections":[{"id":"sec1","title":"Attendee Info","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true},{"id":"f2","type":"short_text","label":"Company","required":true},{"id":"f3","type":"short_text","label":"Position"},{"id":"f4","type":"email","label":"Email","required":true}]},{"id":"sec2","title":"Session Selection","fields":[{"id":"f5","type":"attendance","label":"Will you attend?","required":true},{"id":"f6","type":"checkbox","label":"Workshop Selection","options":[{"id":"o1","label":"Morning Keynote","value":"keynote"},{"id":"o2","label":"Strategy Workshop","value":"strategy"},{"id":"o3","label":"Networking Lunch","value":"lunch"}]},{"id":"f7","type":"dietary","label":"Dietary Requirements"}]}]}',
  'corporate',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Graduation RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'Graduation RSVP',
  'Ceremony attendance and guest count.',
  'Graduation',
  '{"sections":[{"id":"sec1","title":"Guest Info","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true},{"id":"f2","type":"email","label":"Email","required":true},{"id":"f3","type":"phone","label":"Phone"}]},{"id":"sec2","title":"Ceremony","fields":[{"id":"f4","type":"attendance","label":"Will you attend?","required":true},{"id":"f5","type":"guest_count","label":"Number of guests"},{"id":"f6","type":"long_text","label":"Congratulatory Note"}]}]}',
  'graduation',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Baby Shower RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'Baby Shower RSVP',
  'Registry notes, attendance, and gift coordination.',
  'Baby Shower',
  '{"sections":[{"id":"sec1","title":"Guest Info","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true},{"id":"f2","type":"email","label":"Email","required":true}]},{"id":"sec2","title":"Celebration","fields":[{"id":"f3","type":"attendance","label":"Will you attend?","required":true},{"id":"f4":"type":"yes_no","label":"Need address sent privately?"},{"id":"f5","type":"short_text","label":"Gift you plan to bring"},{"id":"f6","type":"long_text","label":"Note for the parents"}]}]}',
  'baby_shower',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- Anniversary RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'Anniversary RSVP',
  'Elegant dinner attendance with meal choices.',
  'Anniversary',
  '{"sections":[{"id":"sec1","title":"Guest Info","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true},{"id":"f2","type":"email","label":"Email","required":true}]},{"id":"sec2","title":"Dinner","fields":[{"id":"f3","type":"attendance","label":"Will you attend?","required":true},{"id":"f4","type":"guest_count","label":"Number of guests"},{"id":"f5","type":"meal","label":"Meal Selection"},{"id":"f6","type":"dietary","label":"Dietary Restrictions"},{"id":"f7","type":"long_text","label":"A memory to share"}]}]}',
  'anniversary',
  true,
  NOW()
) ON CONFLICT DO NOTHING;

-- General Party RSVP Template
INSERT INTO public.form_templates (id, user_id, name, description, category, form_schema, theme_preset, is_system, created_at)
VALUES (
  gen_random_uuid(),
  NULL,
  'General Party RSVP',
  'Flexible party response for any gathering.',
  'Party',
  '{"sections":[{"id":"sec1","title":"Guest Info","fields":[{"id":"f1","type":"short_text","label":"Full Name","required":true},{"id":"f2","type":"email","label":"Email","required":true},{"id":"f3","type":"phone","label":"Phone"}]},{"id":"sec2","title":"Party Details","fields":[{"id":"f4","type":"attendance","label":"Will you attend?","required":true},{"id":"f5","type":"guest_count","label":"Number of guests"},{"id":"f6","type":"long_text","label":"Anything we should know?"}]}]}',
  'party',
  true,
  NOW()
) ON CONFLICT DO NOTHING;
