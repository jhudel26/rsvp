# Atelier RSVP - Modern Event Invitation Platform

A professional, customizable RSVP form builder and event invitation platform built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Dynamic Form Builder**: Create custom RSVP forms with drag-and-drop interface
- **Multiple Field Types**: Support for text, email, phone, dropdowns, checkboxes, dates, and more
- **Theme System**: 9 pre-built themes (Wedding, Birthday, Christmas, Halloween, etc.) with full customization
- **Conditional Logic**: Show/hide fields based on user responses
- **Event Management**: Create, edit, duplicate, and manage multiple events
- **Response Management**: View, filter, search, and export RSVP responses
- **Analytics Dashboard**: Visual charts and statistics for event performance
- **QR Code Generation**: Generate QR codes for easy event sharing
- **Template System**: Save and reuse form templates
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Authentication**: Secure admin authentication via Supabase Auth

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts
- **QR Codes**: qrcode.react
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

### 1. Clone and Install

```bash
cd RSVP
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy:
   - Project URL
   - anon public key
3. Run the SQL schema in Supabase SQL Editor:
   - First run `supabase/schema.sql`
   - Then run `supabase/seed-templates.sql` to add system templates

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles
- `events` - Event details and configurations
- `form_responses` - RSVP submissions
- `form_templates` - Reusable form templates
- `activity_logs` - Audit trail

## Project Structure

```
src/
├── app/
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Admin dashboard
│   │   ├── events/        # Event management
│   │   ├── responses/     # Response management
│   │   ├── templates/     # Template management
│   │   ├── analytics/     # Analytics dashboard
│   │   └── settings/      # User settings
│   └── r/[slug]/          # Public RSVP pages
├── components/
│   ├── auth/              # Auth components
│   ├── dashboard/         # Dashboard layout
│   ├── ui/                # UI components
│   └── qr-code.tsx        # QR code generator
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── forms/             # Form logic and catalog
│   ├── themes/            # Theme presets
│   ├── events/            # Event utilities
│   ├── templates/         # Template system
│   ├── analytics.ts       # Analytics functions
│   ├── export.ts          # Export utilities
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript type definitions
```

## Usage

### Creating an Event

1. Navigate to Dashboard > Events
2. Click "New Event"
3. Choose a template or start from scratch
4. Fill in event details
5. Build your form using the drag-and-drop builder
6. Customize the theme and design
7. Publish your event

### Managing RSVPs

1. Go to Events > [Event Name] > Responses
2. View all submissions with filtering and search
3. Export responses as CSV or JSON
4. View individual response details

### Analytics

1. Navigate to Dashboard > Analytics
2. View overall statistics
3. Analyze attendance by event
4. Track response trends

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## Customization

### Adding New Field Types

1. Add field type to `src/types/forms.ts` FIELD_TYPES array
2. Add field configuration in `src/lib/forms/catalog.ts`
3. Add rendering logic in `src/app/r/[slug]/rsvp-form.tsx`
4. Add validation in `src/lib/forms/logic.ts`

### Adding New Themes

1. Add theme preset to `src/lib/themes/presets.ts`
2. Add to THEME_GALLERY array
3. Theme will automatically appear in design options

### Modifying Templates

Edit system templates in `supabase/seed-templates.sql` or create custom templates via the admin interface.

## Security

- Row Level Security (RLS) enabled on all tables
- Server-side validation for all form submissions
- Admin-only access to event management
- Public access only to published events
- Rate limiting on form submissions

## Performance

- Server Components where possible
- Optimized database queries with proper indexes
- Efficient form validation
- Lazy loading for large datasets
- Image optimization via Next.js Image component

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is built as a demonstration of modern web development practices.

## Support

For issues or questions, please check the documentation or create an issue in the repository.
