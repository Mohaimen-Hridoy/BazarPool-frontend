# 🛒 BazarPool — Frontend Web Application

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**BazarPool Frontend** is a modern, high-performance web interface built with **Next.js 16 (App Router + Turbopack)** and **Tailwind CSS**. It connects community buyers, hostel managers, wholesale agricultural producers, and neighborhood hub coordinators.

---

## 🌟 Key Features

1. **Active Wholesale Pool Explorer**:
   - Live progress bars tracking committed units vs target volume.
   - Real-time search by commodity name and neighborhood hub/city filter.
   - Instant calculation of wholesale price vs retail savings.

2. **Dedicated Campaign Details Page (`/campaigns/[id]`)**:
   - Complete product specifications, hub address, and seller verification.
   - 1-click commitment modal with virtual double-entry wallet reservation.

3. **Multi-Role User Dashboard**:
   - **Consumer**: View active commitments, 1-click cancel with instant fund release, and cryptographic QR pickup passes.
   - **Supplier**: Wholesale campaign launcher modal, product catalog management, and dispatch tracking.
   - **Admin**: System-wide analytics, transaction volumes, and pickup hub registrations.
   - **All**: Double-entry virtual wallet ledger with auditable top-up and debit histories.

4. **Live QR Pickup Scanner (`/pickup-verifier`)**:
   - Camera-based live scanner and manual code entry for hub coordinators.
   - Strict one-time redemption enforcement (409 Conflict protection).

5. **In-App Real-Time Notification Center**:
   - Bell icon with unread badges, notifications on refunds, order arrival, and campaign lock.

---

## 🚀 Local Setup & Execution

### Prerequisites
- Node.js v18+
- BazarPool Backend running on `http://localhost:5000`

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Ensure `NEXT_PUBLIC_API_URL` points to your backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Evaluation Accounts

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Consumer** | `consumer@gmail.com` | `password123` | Commit to pools, view wallet, view QR Pickup Passes |
| **Wholesaler** | `supplier@agrofarm.com` | `password123` | Launch wholesale pools, catalog products, dispatch orders |
| **Hub Lead** | `coordinator@dhanmondi.com` | `password123` | Verify QR token codes, authorize product handovers |
| **Admin** | `admin@bazarpool.com` | `password123` | Full system metrics, register hubs, and audit logs |

---

## 👨‍💻 Author
- **Author:** Mohaimen Hridoy
- **Repository:** [BazarPool-frontend](https://github.com/Mohaimen-Hridoy/BazarPool-frontend)
