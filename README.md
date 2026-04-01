# Zewbie Admin Portal

Internal **administration** UI for the Zewbie platform: **React 19**, **Vite**, **TypeScript**, and **TailwindCSS v4**. Operators manage users, retailers, catalog moderation, orders, disputes, finances, and platform settings.

**Live:** [https://admin.zewbie.com](https://admin.zewbie.com)

## Quick start

```powershell
git clone https://github.com/zewbie/zewbie-admin.git
cd zewbie-admin
npm install
copy .env.example .env
npm run dev
```

The dev server runs at **`http://localhost:5174`** (see `vite.config.ts`).

Set `VITE_API_URL` in `.env` to your Zewbie API base URL (default in `.env.example`: `http://localhost:3000`).

## Architecture

| Layer | Role |
|-------|------|
| **`App.tsx`** | Declares all routes and layout nesting (`AdminLayout`, `AuthLayout`). |
| **`layouts/AdminLayout.tsx`** | Sidebar navigation and shell for authenticated admin pages. |
| **`layouts/AuthLayout.tsx`** | Centered card layout for sign-in and password flows. |
| **`lib/api.ts`** | Axios instance: `VITE_API_URL`, Bearer token from `localStorage` (`admin_token`), 401 → `/auth/login`. |

Styling uses **TailwindCSS** via `@tailwindcss/vite`. Data fetching can use **TanStack Query** and **Zustand** as the app grows beyond placeholders.

## Route list (28 pages)

Routes include **26** primary paths plus **root** and **catch-all** redirects to the dashboard.

| Section | Path | Page |
|---------|------|------|
| Auth | `/auth/login` | Login |
| Auth | `/auth/forgot-password` | Forgot password |
| Auth | `/auth/reset-password/:token` | Reset password |
| Dashboard | `/dashboard` | Dashboard |
| Users | `/users` | User list |
| Users | `/users/:id` | User detail |
| Retailers | `/retailers` | Retailer list |
| Retailers | `/retailers/approvals` | Retailer approvals |
| Retailers | `/retailers/:id` | Retailer detail |
| Catalog | `/catalog/products` | Product list |
| Catalog | `/catalog/products/approvals` | Product approvals |
| Catalog | `/catalog/products/:id` | Product detail |
| Catalog | `/catalog/categories` | Categories |
| Catalog | `/catalog/categories/:id` | Category detail |
| Catalog | `/catalog/attributes` | Attributes |
| Orders | `/orders` | Order list |
| Orders | `/orders/:id` | Order detail |
| Disputes | `/disputes` | Dispute list |
| Disputes | `/disputes/:id` | Dispute detail |
| Finances | `/finances` | Finance overview |
| Finances | `/finances/transactions` | Transactions |
| Finances | `/finances/payouts/users` | User payouts |
| Finances | `/finances/payouts/retailers` | Retailer payouts |
| Settings | `/settings` | Settings |
| Settings | `/settings/audit-log` | Audit log |
| Dev | `/api-test` | API test panel |
| Redirect | `/` | → `/dashboard` |
| Redirect | `*` | → `/dashboard` |

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Zewbie Universal API base URL | `http://localhost:3000` |

## Project structure

```text
src/
├── App.tsx
├── main.tsx
├── lib/api.ts
├── layouts/
│   ├── AdminLayout.tsx
│   └── AuthLayout.tsx
└── pages/
    ├── Dashboard.tsx
    ├── ApiTestPanel.tsx
    ├── auth/
    ├── users/
    ├── retailers/
    ├── catalog/
    ├── orders/
    ├── disputes/
    ├── finances/
    └── settings/
```

## Related repositories

- **zewbie-api** — NestJS backend and `/api/docs` Swagger.
- **zewbie-app**, **zewbie-retailer** — Creator and retailer portals.
- **zewbie-infra** — Local Docker stack and AWS Terraform.

## License

Private (see repository settings).
