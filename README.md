# Gali'Pet

Mobile app connecting pet owners with vetted professionals in Morocco — bookings, real-time messaging, reviews, and pet insurance leads.

---

## Overview

Gali'Pet is a React Native mobile application backed by a Node.js REST API. Pet owners can browse professionals (vets, groomers, dog walkers, trainers), book available slots, chat directly with the professional, and leave reviews. Professionals manage their availability, confirm or refuse bookings, and mark services as completed.

---

## Features

- **Authentication** — Register/login as owner, professional, or both
- **Explore** — Browse and filter professionals by service type and city
- **Pro profiles** — Bio, services, verified badge, rating, pricing, availability slots, and reviews
- **Bookings** — Full lifecycle: pending → confirmed → completed or cancelled
- **Real-time messaging** — Per-booking conversation with Supabase Realtime, unread badge, message deletion
- **Reviews** — Star ratings and comments on completed bookings, reflected in pro's average rating
- **Pet management** — Add/remove pets with species, breed, age, weight
- **Profile editing** — Avatar, bio, city, phone, pricing
- **Pet insurance leads** — Owners can submit insurance inquiries tracked through a CRM pipeline
- **Admin panel** — Manage insurance leads (new → contacted → converted/rejected)

---

## Tech Stack

### Mobile (`galipet-mobile`)
| | |
|---|---|
| Framework | React Native + Expo (SDK 52) |
| Navigation | Expo Router (file-system routing) |
| State | Zustand |
| HTTP | Axios |
| Realtime | Supabase Realtime (Postgres changes) |
| Language | TypeScript |

### API (`galipet-api`)
| | |
|---|---|
| Runtime | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + JWT middleware |
| File storage | Cloudinary |
| Push notifications | Firebase FCM |
| Deployment | Koyeb |
| Language | TypeScript |

---

## Project Structure

```
galipet-app/
├── galipet-api/          # REST API
│   ├── src/
│   │   ├── modules/      # Feature modules (auth, bookings, profiles, …)
│   │   ├── middleware/   # Auth, error handling
│   │   ├── config/       # Supabase client
│   │   ├── utils/        # Response helpers, cron
│   │   └── scripts/      # DB seed
│   └── .env.example
│
└── galipet-mobile/       # React Native app
    ├── app/              # Screens (Expo Router)
    │   ├── (auth)/       # Login, register
    │   ├── (app)/        # Authenticated screens + tabs
    │   └── (admin)/      # Admin panel
    └── src/
        ├── components/   # Shared UI components
        ├── constants/    # Colors
        ├── hooks/        # Business logic hooks
        ├── services/     # API layer
        ├── store/        # Zustand stores
        └── types/        # Shared TypeScript types
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A [Supabase](https://supabase.com) project
- A [Cloudinary](https://cloudinary.com) account (for avatar/pet photo uploads)

### API setup

```bash
cd galipet-api
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLOUDINARY_*, etc.
npm install
npm run dev
```

### Seed the database

```bash
cd galipet-api
npx ts-node src/scripts/seed.ts
```

This creates all test users, professionals, pets, availability slots, bookings, reviews, and messages.

Scan the QR code with [Expo Go](https://expo.dev/client) on your phone.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/profiles/search` | Search professionals |
| GET | `/api/profiles/:id` | Get profile |
| PUT | `/api/profiles/me` | Update own profile |
| GET | `/api/bookings` | List my bookings |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| GET | `/api/availability/professional/:id` | Get available slots |
| POST | `/api/availability` | Create slot (pro only) |
| GET | `/api/messages/:bookingId` | Get conversation |
| POST | `/api/messages` | Send message |
| DELETE | `/api/messages/:id` | Delete message |
| GET | `/api/reviews/professional/:id` | Get pro reviews |
| POST | `/api/reviews` | Submit review |
| GET | `/api/pets` | Get my pets |
| POST | `/api/pets` | Add pet |
| DELETE | `/api/pets/:id` | Delete pet |

---

## License

MIT
