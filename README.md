# 🏡 Haven Realty

A modern **full-stack real estate marketplace** built with the MERN stack. Users can discover properties, search and filter listings, save favorites, contact agents, send messages, and manage their own listings.

Admins can manage users, approve/reject properties, review reports, and monitor platform activity.

**No payment system and no email verification.**

## ✨ Features

* 🔐 JWT Authentication & Role-Based Access
* 🏠 Property Listings & Advanced Search
* 🔎 Filters, Sorting & Pagination
* ❤️ Favorites
* 💬 Agent Inquiries & Direct Messaging
* 👤 Agent Directory
* 🛡️ Admin Dashboard & Property Moderation
* 🚩 Property Reporting
* 📸 Cloudinary Image Uploads
* 📱 Fully Responsive UI
* ✉️ Optional Email Notifications

## 🛠️ Tech Stack

**Frontend:** React, Vite, JavaScript, Tailwind CSS, React Router, Axios, Framer Motion

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Cloudinary, Nodemailer

## 🚀 Getting Started

```bash
git clone <repository-url>
cd haven-realty
npm run install:all
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

## 🔑 Environment Variables

Create `.env` files for both `client` and `server`.

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Cloudinary and SMTP configuration are optional.

## 👨‍💻 Project

Built as a full-stack portfolio project demonstrating **authentication, REST APIs, database design, file uploads, role-based authorization, and real-world marketplace workflows.**
