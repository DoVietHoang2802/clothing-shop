# Clothing Shop

A full-stack e-commerce web application for browsing products, managing orders and inventory, and supporting role-based store operations.

## Demo

- Frontend: [clothing-shop-ashy.vercel.app](https://clothing-shop-ashy.vercel.app)

## Features

- Product catalog with search, category and price filters, pagination, stock-aware sorting, reviews, wishlist, and delivery addresses.
- Cart and checkout flows with coupon validation, COD, and MoMo UAT payment initiation.
- Transactional order creation that records the order, updates inventory, and increments coupon usage together.
- Role-based User, Staff, and Admin operations for catalog, orders, coupons, users, and dashboard metrics.
- Google sign-in through Firebase Admin SDK alongside local JWT authentication.
- Real-time order status and notification updates through Server-Sent Events with heartbeat support.
- Admin dashboard metrics built with MongoDB aggregation pipelines.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express, REST API |
| Data | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs, Firebase Google sign-in, RBAC |
| Realtime | Server-Sent Events |
| Payments | MoMo UAT, COD |
| Media | Multer uploads |
| Deployment | Vercel frontend, Render backend |

## Architecture

```text
React client
  -> Axios service layer
  -> Express routes
  -> Controllers and middleware
  -> Mongoose models
  -> MongoDB Atlas
```

The backend keeps routing, controller logic, authentication/authorization middleware, and persistence models in separate directories. The frontend separates reusable components, pages, API services, contexts, and real-time configuration.

## Local Setup

### 1. Configure environment variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=use_a_long_random_secret
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_json
```

Create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

MoMo UAT variables are required only when testing the MoMo payment flow. Never commit credentials or production connection strings.

### 2. Run the backend

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:5000/api`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## API Overview

| Area | Base route | Access |
| --- | --- | --- |
| Authentication | `/api/auth` | Public and authenticated users |
| Products and categories | `/api/products`, `/api/categories` | Public reads; Staff/Admin writes |
| Orders and payments | `/api/orders`, `/api/momo` | Authenticated users, Staff, and Admin |
| Store operations | `/api/admin`, `/api/coupons`, `/api/users` | Role-based |
| Customer features | `/api/reviews`, `/api/wishlist`, `/api/addresses` | Public reads or authenticated users |

API request examples are available in the local Postman collection documentation.

## Roles

| Capability | User | Staff | Admin |
| --- | :---: | :---: | :---: |
| Browse and order | Yes | Yes | Yes |
| Manage products and orders | No | Yes | Yes |
| Manage categories, coupons, and users | No | No | Yes |
| View dashboard metrics | No | Yes | Yes |

## Notes

- MoMo integration targets the UAT/test environment, not a production merchant flow.
- Real-time updates use SSE to remain compatible with the hosted backend constraints.
- `SESSION_NOTES.md` and `PRESENTATION_OUTLINE.md` are local-only working materials and are intentionally excluded from Git.
