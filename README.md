# Haven Realty — Full-Stack Real Estate Marketplace

A production-ready real estate marketplace built with the MERN stack (MongoDB, Express, React, Node). Users can browse, search, and filter properties, save favorites, contact agents, and list their own properties. Admins moderate listings, manage users, and view platform analytics.

There is **no payment system** — this platform is strictly for property discovery, listing management, and communication.

## Features

- **Authentication**: JWT-based register/login/logout, protected routes, role-based authorization (user, agent, admin), profile management, password change.
- **Property listings**: full CRUD, multi-image upload (Cloudinary or local disk fallback), search, filters (location, type, listing type, price range, bedrooms, bathrooms, amenities), sorting, pagination.
- **Favorites**: save/unsave properties, dedicated favorites dashboard.
- **Inquiries**: contact-agent form on every listing, inquiry inbox for both sender and recipient, status tracking (pending/contacted/closed).
- **Messaging**: lightweight REST-based direct messaging between users with conversation threads and unread counts.
- **Agents directory**: public agent listing and profile pages showing an agent's approved properties.
- **Admin dashboard**: platform statistics with charts, user management (deactivate/delete), property moderation (approve/reject/delete), pending-listing queue, reported-property review.
- **Property reporting**: users can flag a listing; admins review and dismiss or delete it from the Reports page.
- **Emails**: Nodemailer notifications for registration, inquiries, approvals, and rejections (fails gracefully if SMTP isn't configured).
- **UX polish**: skeleton loaders, empty states, toast notifications, Framer Motion animations, responsive layout (mobile → large desktop), image lightbox gallery.

## Tech Stack

**Frontend**: React 18, Vite, JavaScript, React Router DOM, Axios, Tailwind CSS, Lucide React, React Hook Form, Context API, React Toastify, Framer Motion, Recharts (admin charts).

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, Cloudinary (with local-disk fallback), Nodemailer, Helmet, CORS, express-rate-limit, express-mongo-sanitize, dotenv.

## Project Structure

```text
real-estate-platform/
├── client/                 React + Vite frontend
│   ├── src/
│   │   ├── components/     Reusable UI, layout, property, agent, dashboard, admin components
│   │   ├── pages/          Route-level pages (public, dashboard/, admin/)
│   │   ├── layouts/        MainLayout, DashboardLayout, AdminLayout
│   │   ├── context/        AuthContext, FavoritesContext
│   │   ├── services/       Axios API clients (one per resource)
│   │   ├── hooks/          useDebounce
│   │   └── utils/          Formatters
│   └── ...
├── server/                 Express + MongoDB backend
│   ├── config/              db.js, cloudinary.js
│   ├── controllers/         Route handlers (auth, property, favorite, inquiry, agent, message, admin, contact)
│   ├── middleware/          auth, upload, error handling
│   ├── models/               User, Property, Favorite, Inquiry, Message
│   ├── routes/                REST routers
│   ├── seed/                  Database seed script
│   ├── utils/                  Token, email, image upload, ApiError helpers
│   └── server.js
└── README.md
```

## Installation

```bash
git clone <repository-url>
cd real-estate-platform

# Install both apps
npm run install:all
# (or individually: cd server && npm install   /   cd client && npm install)
```

## Environment Variables

Copy the example files and fill in real values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/real_estate
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="Real Estate Platform <no-reply@realestate.local>"

CLIENT_URL=http://localhost:5173

ADMIN_NAME=Platform Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=+2348000000000
ADMIN_PASSWORD=change-me-now
```

`client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### MongoDB Setup

Use either a local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, then set `MONGO_URI` accordingly. Local example: `mongodb://127.0.0.1:27017/real_estate`. Atlas example: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/real_estate`.

### Cloudinary Setup (optional)

If `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are left blank, uploaded images are automatically stored on local disk under `server/uploads` and served from `/uploads`. Fill them in to use Cloudinary in production.

### Email Setup (optional)

If SMTP variables are left blank, the app logs a skipped-email message instead of failing — registration, inquiries, and admin actions all continue to work without email delivery.

## Database Seeding

Populates the database with 1 admin, 5 agents, and 15 realistic Nigerian properties (Lekki, Ikoyi, Victoria Island, Yaba, Ikeja, Ajah, Surulere, Gbagada, Lagos Island, Abuja).

```bash
cd server
npm run seed          # seed the database
npm run seed:destroy  # wipe all collections without reseeding
```

## Running the Application

From the project root (runs both apps together via `concurrently`):

```bash
npm run install:all
npm run dev
```

Or individually:

```bash
# Terminal 1
cd server
npm run dev      # http://localhost:5000

# Terminal 2
cd client
npm run dev      # http://localhost:5173
```

## Test Credentials

After seeding:

| Role  | Email                        | Password       |
|-------|-------------------------------|-----------------|
| Admin | value of `ADMIN_EMAIL`        | value of `ADMIN_PASSWORD` |
| Agent | adaeze.okafor@example.com (and 4 others) | password123 |

Admin accounts are never created through the public registration form — only via the seed script / environment variables.

## API Endpoint Summary

**Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/change-password`

**Properties**: `GET /api/properties`, `GET /api/properties/featured`, `GET /api/properties/categories`, `GET /api/properties/my-properties`, `GET /api/properties/:id`, `POST /api/properties`, `PUT /api/properties/:id`, `DELETE /api/properties/:id`, `POST /api/properties/:id/report`

**Favorites**: `GET /api/favorites`, `POST /api/favorites/:propertyId`, `DELETE /api/favorites/:propertyId`

**Inquiries**: `POST /api/inquiries`, `GET /api/inquiries?scope=sent|received`, `GET /api/inquiries/:id`, `PUT /api/inquiries/:id`

**Messages**: `POST /api/messages`, `GET /api/messages/conversations`, `GET /api/messages/:userId`

**Agents**: `GET /api/agents`, `GET /api/agents/:id`

**Admin** (all require admin role): `GET /api/admin/stats`, `GET /api/admin/users`, `DELETE /api/admin/users/:id`, `PUT /api/admin/users/:id/status`, `GET /api/admin/properties`, `PUT /api/admin/properties/:id/approve`, `PUT /api/admin/properties/:id/reject`, `DELETE /api/admin/properties/:id`, `PUT /api/admin/properties/:id/dismiss-report`

**Contact**: `POST /api/contact`

All responses follow `{ success, message, data }` (or `{ success, properties, page, pages, total }` for the paginated property list) and errors follow `{ success: false, message }`.

## Authentication Flow

1. Register or login returns a JWT (`token`) and the user object.
2. The client stores the token in `localStorage` and attaches it as `Authorization: Bearer <token>` on every request via an Axios interceptor.
3. Protected backend routes validate the token with `protect` middleware; role-gated routes add `authorize('admin')`.
4. On the frontend, `ProtectedRoute` and `AdminRoute` guard the relevant route trees; a 401 response globally clears the session and redirects to `/login`.

## Deployment

- **Backend**: deploy `server/` to any Node host (Render, Railway, Fly.io, a VPS). Set all environment variables from `.env.example`, point `MONGO_URI` at Atlas, and set `CLIENT_URL` to your deployed frontend origin.
- **Frontend**: run `npm run build` inside `client/` and deploy the `dist/` folder to any static host (Vercel, Netlify, Render static site). Set `VITE_API_URL` to your deployed backend's `/api` URL at build time.
- Ensure CORS (`CLIENT_URL`) and Cloudinary/SMTP credentials are updated for the production environment.

## Known Limitations

- Messaging is REST-based (polling on open), not real-time (no WebSockets).
- Image uploads fall back to local disk storage when Cloudinary isn't configured — fine for development, but use Cloudinary (or another persistent store) in production since local disk storage doesn't survive redeploys on most hosts.
- The "Agents" directory includes any user flagged `isAgent`/`role: agent` or who owns at least one approved property; there's no separate agent-application workflow.
- Rate limiting and other security middleware use in-memory stores, which reset on server restart and don't share state across multiple server instances — use a shared store (e.g. Redis) for a multi-instance production deployment.
