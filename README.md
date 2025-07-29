# Dayspring Behavioural Therapeutic Services - Landing Page & Admin Portal

This is a [Next.js](https://nextjs.org/) project for the Dayspring Behavioural Therapeutic Services (DBTS) website. It includes a public-facing landing page, an online booking system for consultations, and a comprehensive admin panel for managing site content, availability, and appointments.

The project is built with the Next.js App Router and utilizes Supabase for the database, authentication, and storage.

---

## Features

### Public-Facing Website (`/`)

- **Dynamic Homepage:** All content on the homepage is editable through the admin panel, including text, images, and contact information.
- **Smooth Scrolling:** Implemented with `react-scroll` for an enhanced user experience.
- **Online Booking System (`/book`):** A multi-step form allowing clients to book available consultation slots.
- **Contact Form:** A functional contact form that sends inquiries to the business and an auto-reply to the user.
- **Responsive Design:** The entire public site is designed to work seamlessly on desktop and mobile devices.

### Admin Panel (`/admin`)

- **Secure Authentication:** The admin panel is protected and requires a login.
- **Dashboard:** A central hub for managing the site.
- **Content Management (`/admin/content`):** A full-featured editor to update all sections of the public homepage without needing to touch the code.
- **Availability Management (`/admin/availability`):**
  - Set recurring weekly availability for client consultations.
  - Block out specific dates or times to override the recurring schedule.
- **Booking Management (`/admin/bookings`):**
  - View all upcoming appointments.
  - Confirm, cancel, or reschedule pending and confirmed bookings.
  - Manually create new appointments for clients.
- **Settings (`/admin/settings`):**
  - Update the public contact email for the website.
  - Change the admin account's login email and password.

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Backend & DB:** [Supabase](https://supabase.io/) (PostgreSQL, Auth, Storage)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Email:** [Resend](https://resend.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Date & Time:** [date-fns](https://date-fns.org/)
- **Deployment:** Vercel, Netlify, or any other platform that supports Next.js

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, or pnpm
- A Supabase account and project
- A Resend account and API key

---

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd dbts-landing-page
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

- Log in to your Supabase account and create a new project.
- In your Supabase project, go to the SQL Editor and run the necessary SQL scripts to create your tables (`homepage_content`, `bookings`, `profiles`, etc.).
- You will also need to create the `get_admin_email` function.
- Go to **Project Settings > API** to find your **Project URL** and **anon key**.

### 4. Set up Environment Variables

Create a new file named `.env.local` in the root of your project and add the following variables:

```env
# .env.local

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Resend API Key
RESEND_API_KEY=YOUR_RESEND_API_KEY
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000/) in your browser to see the public website.

---

## Admin Panel Access

To access the admin panel:

1. Go to your Supabase project > Authentication.
2. Click on **"Add user"** and create a user.
3. Navigate to http://localhost:3000/login and sign in using the credentials.

---

## Running in Production

To run the application in production mode locally:

```bash
npm run build
npm run start
```

---

## Deployment

The easiest way to deploy this Next.js application is to use the **Vercel Platform**.

When deploying, make sure to set the following environment variables in your hosting provider’s settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
