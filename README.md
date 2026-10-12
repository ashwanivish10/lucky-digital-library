# Lucky Digital Library

A full-stack MERN library management system with a premium public website and secure admin dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (Atlas) |
| Auth | Argon2id + JWT (HTTP-only cookies) |
| PDF | Puppeteer |
| Icons | Lucide React |
| Charts | Recharts |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone / Navigate to project

```bash
cd ldl
```

### 2. Server Setup

```bash
cd server
cp .env.example .env
# Edit .env — set MONGODB_URI to your Atlas connection string
npm install
npm run seed          # creates admin account + default plans + site settings
npm run dev           # starts on http://localhost:5000
```

### 3. Client Setup

```bash
cd ../client
npm install
npm run dev           # starts on http://localhost:5173
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | required |
| `JWT_SECRET` | Long random string for JWT signing | required |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `UPLOADS_DIR` | Path for uploaded images | `./uploads` |
| `SEED_ADMIN_EMAIL` | Admin email created by seed | `admin@luckylibrary.in` |
| `SEED_ADMIN_PASSWORD` | Admin password for seed | `Admin@1234` |

> ⚠️ **Change the seed password immediately after first login!**

---

## Default Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@luckylibrary.in` | `Admin@1234` |

---

## Application Routes

### Public
| Path | Page |
|---|---|
| `/` | Homepage |
| `/about` | About |
| `/facilities` | Facilities |
| `/membership` | Membership Plans |
| `/rules` | Library Rules |
| `/contact` | Contact |
| `/register` | Student Self-Registration |
| `/login` | Login |

### Student Portal
| Path | Description |
|---|---|
| `/portal` | Student dashboard (membership, payments) |

### Admin Dashboard
| Path | Description |
|---|---|
| `/admin` | Dashboard with metrics & charts |
| `/admin/students` | Student directory |
| `/admin/students/new` | Add student |
| `/admin/students/:id` | Student detail |
| `/admin/approvals` | Pending registrations |
| `/admin/payments` | Payment list |
| `/admin/payments/record` | Record payment |
| `/admin/plans` | Membership plan management |
| `/admin/settings` | Site settings |

---

## API Endpoints

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/change-password

GET    /api/students               (admin)
POST   /api/students               (admin)
POST   /api/students/register      (public)
GET    /api/students/:id           (admin or own student)
PATCH  /api/students/:id           (admin)
PATCH  /api/students/:id/status    (admin)
POST   /api/students/:id/approve   (admin)

GET    /api/memberships            (admin)
POST   /api/memberships            (admin)
PATCH  /api/memberships/:id        (admin)
POST   /api/memberships/:id/renew  (admin)
POST   /api/memberships/refresh-statuses

GET    /api/payments               (admin or own student)
POST   /api/payments               (admin)
GET    /api/payments/report        (admin)
GET    /api/payments/:id/receipt   (admin or own student)
POST   /api/payments/:id/adjustments (admin)

GET    /api/settings/public        (public)
POST   /api/settings/contact       (public)
GET    /api/settings               (admin)
PATCH  /api/settings               (admin)
POST   /api/settings/upload        (admin)
GET    /api/settings/plans         (public)
POST   /api/settings/plans         (admin)
PATCH  /api/settings/plans/:id     (admin)
DELETE /api/settings/plans/:id     (admin)

GET    /api/settings/dashboard/summary   (admin)
GET    /api/settings/dashboard/analytics (admin)
```

---

## Financial Accuracy

- All monetary values stored as **integer paise** (100 paise = ₹1) to avoid floating-point errors.
- Fee snapshots captured at membership creation — plan price changes do not affect historical records.
- Adjustments are additive audit records, never destructive overwrites.
- Payment idempotency keys prevent duplicate submissions.

---

## Security

- Passwords hashed with Argon2id
- JWT stored in HTTP-only cookies (and optionally localStorage bearer tokens)
- Rate limiting on auth endpoints (20 req / 15 min)
- CORS restricted to configured `CLIENT_URL`
- Helmet headers applied
- Server-side validation with Zod on all inputs
- Admin-only routes protected both on frontend (UI guards) and backend (middleware)
- Students can only access their own records

---

## Production Deployment

### Environment

Set `NODE_ENV=production` in server `.env`.

### Build frontend

```bash
cd client
npm run build         # outputs to client/dist/
```

Serve `client/dist/` with Nginx or any static host (Vercel, Netlify, etc.).

### Run backend

```bash
cd server
npm run build
npm start             # runs compiled dist/index.js
```

Or use a process manager:

```bash
npm install -g pm2
pm2 start dist/index.js --name ldl-server
pm2 save
```

### Nginx example (reverse proxy)

```nginx
server {
  listen 80;
  server_name yourdomain.com;

  location / {
    root /var/www/ldl/client/dist;
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
  }

  location /uploads {
    proxy_pass http://localhost:5000;
  }
}
```

---

## Database Backup

```bash
# Export (replace with your cluster details)
mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d)

# Import
mongorestore --uri="$MONGODB_URI" ./backups/YYYYMMDD/
```

Set up automated daily backups via MongoDB Atlas or a cron job.

---

## Upgrading Multer

The current version uses `multer@1.x`. For production, upgrade to Multer 2.x:

```bash
cd server
npm install multer@2
```

Update the import syntax as needed per Multer 2 documentation.
