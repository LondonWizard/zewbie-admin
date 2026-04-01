# Zewbie Admin Portal

Admin management portal for the Zewbie platform. Built with React, Vite, TypeScript, and TailwindCSS.

## Tech Stack

- **React 19** with TypeScript
- **Vite** — dev server on port 5174
- **React Router v7** — client-side routing with nested layouts
- **TailwindCSS v4** — utility-first styling via Vite plugin
- **Axios** — API client (`src/lib/api.ts`) with auth interceptors
- **Zustand** — state management (configured, not yet used)
- **TanStack React Query** — server-state management (configured, not yet used)
- **Lucide React** — icon library

## Project Structure

```
src/
├── App.tsx                   # Router with all routes
├── main.tsx                  # Entry point
├── index.css                 # Tailwind import
├── lib/
│   └── api.ts                # Axios instance (base URL from VITE_API_URL)
├── layouts/
│   ├── AdminLayout.tsx       # Sidebar + content area (authenticated routes)
│   └── AuthLayout.tsx        # Centered card layout (auth routes)
└── pages/
    ├── Dashboard.tsx          # /dashboard — main overview
    ├── ApiTestPanel.tsx       # /api-test — API connectivity tester
    ├── auth/
    │   ├── Login.tsx          # /auth/login
    │   ├── ForgotPassword.tsx # /auth/forgot-password
    │   └── ResetPassword.tsx  # /auth/reset-password/:token
    ├── users/
    │   ├── UserList.tsx       # /users
    │   └── UserDetail.tsx     # /users/:id
    ├── retailers/
    │   ├── RetailerList.tsx   # /retailers
    │   ├── RetailerDetail.tsx # /retailers/:id
    │   └── RetailerApprovals.tsx # /retailers/approvals
    ├── catalog/
    │   ├── ProductList.tsx    # /catalog/products
    │   ├── ProductDetail.tsx  # /catalog/products/:id
    │   ├── ProductApprovals.tsx # /catalog/products/approvals
    │   ├── Categories.tsx     # /catalog/categories
    │   ├── CategoryDetail.tsx # /catalog/categories/:id
    │   └── Attributes.tsx     # /catalog/attributes
    ├── orders/
    │   ├── OrderList.tsx      # /orders
    │   └── OrderDetail.tsx    # /orders/:id
    ├── disputes/
    │   ├── DisputeList.tsx    # /disputes
    │   └── DisputeDetail.tsx  # /disputes/:id
    ├── finances/
    │   ├── FinanceOverview.tsx # /finances
    │   ├── Transactions.tsx   # /finances/transactions
    │   ├── UserPayouts.tsx    # /finances/payouts/users
    │   └── RetailerPayouts.tsx # /finances/payouts/retailers
    └── settings/
        ├── Settings.tsx       # /settings
        └── AuditLog.tsx       # /settings/audit-log
```

## Routes (30 total)

| Section    | Route                          | Page               |
|------------|--------------------------------|--------------------|
| Auth       | /auth/login                    | Login              |
| Auth       | /auth/forgot-password          | ForgotPassword     |
| Auth       | /auth/reset-password/:token    | ResetPassword      |
| Dashboard  | /dashboard                     | Dashboard          |
| Users      | /users                         | UserList           |
| Users      | /users/:id                     | UserDetail         |
| Retailers  | /retailers                     | RetailerList       |
| Retailers  | /retailers/:id                 | RetailerDetail     |
| Retailers  | /retailers/approvals           | RetailerApprovals  |
| Catalog    | /catalog/products              | ProductList        |
| Catalog    | /catalog/products/:id          | ProductDetail      |
| Catalog    | /catalog/products/approvals    | ProductApprovals   |
| Catalog    | /catalog/categories            | Categories         |
| Catalog    | /catalog/categories/:id        | CategoryDetail     |
| Catalog    | /catalog/attributes            | Attributes         |
| Orders     | /orders                        | OrderList          |
| Orders     | /orders/:id                    | OrderDetail        |
| Disputes   | /disputes                      | DisputeList        |
| Disputes   | /disputes/:id                  | DisputeDetail      |
| Finances   | /finances                      | FinanceOverview    |
| Finances   | /finances/transactions         | Transactions       |
| Finances   | /finances/payouts/users        | UserPayouts        |
| Finances   | /finances/payouts/retailers    | RetailerPayouts    |
| Settings   | /settings                      | Settings           |
| Settings   | /settings/audit-log            | AuditLog           |
| API Test   | /api-test                      | ApiTestPanel       |
| Redirect   | /                              | → /dashboard       |
| Redirect   | *                              | → /dashboard       |

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and set API URL
cp .env.example .env

# Start dev server (port 5174)
npm run dev
```

## Environment Variables

| Variable       | Default                  | Description          |
|----------------|--------------------------|----------------------|
| VITE_API_URL   | http://localhost:3000     | Backend API base URL |

## API Client

`src/lib/api.ts` exports a pre-configured Axios instance that:
- Reads `VITE_API_URL` for the base URL
- Attaches `admin_token` from localStorage as a Bearer token
- Redirects to `/auth/login` on 401 responses

## Sidebar Navigation

The `AdminLayout` sidebar groups links into collapsible sections:
Dashboard, Users, Retailers, Catalog, Orders, Disputes, Finances, Settings, and API Tests.
Active links are highlighted with indigo styling.
