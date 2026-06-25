# VendorBridge — Procurement & Vendor Management ERP

A centralized enterprise resource planning platform designed to simplify and digitize procurement operations. VendorBridge manages the full procurement lifecycle — from vendor registration and RFQ creation through quotation comparison, multi-level approvals, purchase order generation, and invoice management.
---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Screens](#screens)
- [User Roles & Permissions](#user-roles--permissions)
- [Procurement Workflow](#procurement-workflow)
- [Seed Data & Demo Accounts](#seed-data--demo-accounts)
- [Environment Variables](#environment-variables)

---

## Overview

VendorBridge eliminates manual procurement inefficiencies by enabling structured workflows, centralized vendor communication, and real-time procurement tracking. The platform supports Indian GST tax calculations (CGST/SGST split), immutable audit logging, and role-based access control for four distinct user roles.

---

## Features

### Core Capabilities

- **Vendor Management** — Register, search, filter, and manage supplier profiles with GST details, categories, ratings, and status tracking (Active / Pending / Blocked)
- **RFQ Creation** — Multi-step wizard for creating Requests for Quotation with line items, vendor assignment, deadline selection, and file attachments
- **Quotation Submission** — Vendor-facing interface for submitting itemized quotations with pricing, delivery timelines, GST calculations, and payment terms
- **Quotation Comparison** — Side-by-side comparison of vendor quotations with automatic lowest-price highlighting, vendor rating indicators, and one-click vendor selection
- **Approval Workflow** — Multi-level approval chain (Submitted → L1 Review → L2 Approval → Generate PO) with approve/reject actions, comments, and status tracking
- **Purchase Order Generation** — Auto-generated PO numbers, itemized breakdowns, CGST/SGST tax splits, bill-to and vendor address/GSTIN details
- **Invoice Management** — Dedicated invoice view with INV- prefixed numbers, search/filter by payment status, Download PDF, Print, and Email Invoice actions
- **Activity Logs** — Immutable, write-once audit trail recording every procurement action with category filters and chronological timeline
- **Reports & Analytics** — Vendor performance metrics, monthly procurement trend line charts, spending by category bar charts, RFQ/approval status pie charts, and exportable reports

### Technical Highlights

- **Dark theme** UI with emerald green (#10B981) accent on zinc-950/900 backgrounds
- **Responsive design** with collapsible sidebar navigation for mobile
- **Role-based access control** with four distinct roles and permission levels
- **Real-time GST calculations** — automatic CGST (9%) and SGST (9%) computation
- **Immutable audit logs** — database schema enforced (no `updatedAt`, no soft delete)
- **Session persistence** via Zustand + localStorage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (New York style) |
| **Database** | SQLite via Prisma ORM |
| **State Management** | Zustand (client state) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod validation |
| **Notifications** | Sonner (toast) |
| **Animations** | Framer Motion |
| **Package Manager** | Bun |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0+)
- Node.js 18+ (for tooling compatibility)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd vendorbridge

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Push database schema
bun run db:push

# Start the development server
bun run dev
```

The application will be available at `http://localhost:3000`.

### First-Time Setup

On the login page, click **"Load Sample Data"** to seed the database with demo vendors, RFQs, quotations, approvals, purchase orders, and activity logs. Then log in with one of the demo accounts (see [Seed Data & Demo Accounts](#seed-data--demo-accounts)).

---

## Project Structure

```
vendorbridge/
├── prisma/
│   └── schema.prisma              # Database schema (12 models)
├── db/
│   └── custom.db                  # SQLite database file
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (dark theme, fonts, toaster)
│   │   ├── page.tsx               # Entry point (auth gate + view router)
│   │   ├── globals.css            # Dark theme CSS variables
│   │   └── api/                   # API route handlers
│   │       ├── auth/route.ts
│   │       ├── vendors/route.ts
│   │       ├── vendors/[id]/route.ts
│   │       ├── rfqs/route.ts
│   │       ├── rfqs/[id]/route.ts
│   │       ├── quotations/route.ts
│   │       ├── quotations/[id]/route.ts
│   │       ├── approvals/route.ts
│   │       ├── approvals/[id]/route.ts
│   │       ├── purchase-orders/route.ts
│   │       ├── purchase-orders/[id]/route.ts
│   │       ├── activity-logs/route.ts
│   │       ├── dashboard/route.ts
│   │       ├── reports/route.ts
│   │       └── seed/route.ts
│   ├── components/
│   │   ├── AppSidebar.tsx         # Navigation sidebar
│   │   ├── AppShell.tsx           # Main layout + view router
│   │   ├── ui/                    # shadcn/ui components (40+)
│   │   └── views/                 # Screen-level components
│   │       ├── LoginView.tsx
│   │       ├── DashboardView.tsx
│   │       ├── VendorsView.tsx
│   │       ├── RfqsView.tsx
│   │       ├── QuotationSubmitView.tsx
│   │       ├── QuotationComparisonView.tsx
│   │       ├── ApprovalWorkflowView.tsx
│   │       ├── PurchaseOrderView.tsx
│   │       ├── InvoicesView.tsx
│   │       ├── ActivityLogsView.tsx
│   │       └── ReportsView.tsx
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── lib/
│       ├── db.ts                  # Prisma client singleton
│       ├── store.ts               # Zustand store
│       └── utils.ts               # Utility functions (cn, etc.)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .env                           # Environment variables
```

---

## Database Schema

The application uses **12 Prisma models** with the following relationships:

```
User ──1:1──> Vendor
User ──1:N──> RFQ
User ──1:N──> Approval
User ──1:N──> ApprovalStep
User ──1:N──> ActivityLog

Vendor ──M:N──> RFQ          (via RFQVendor junction)
Vendor ──1:N──> Quotation
Vendor ──1:N──> PurchaseOrder

RFQ ──1:N──> LineItem
RFQ ──1:N──> Quotation
RFQ ──1:1──> Approval
RFQ ──1:1──> PurchaseOrder

Quotation ──1:N──> QuotationItem
Quotation ──1:1──> Approval

Approval ──1:N──> ApprovalStep
Approval ──1:1──> PurchaseOrder

PurchaseOrder ──1:N──> PurchaseOrderItem

ActivityLog (immutable — no updatedAt, no soft delete)
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `ActivityLog` has no `updatedAt` field | Audit logs must be immutable — write-once, no edit or delete |
| `RFQVendor` junction table | Many-to-many relationship between RFQs and Vendors |
| `Approval.currentStep` integer | Tracks the 4-step workflow state machine (1=Submitted, 2=L1 Review, 3=L2 Approval, 4=Generate PO) |
| CGST + SGST split on `PurchaseOrder` | Indian GST compliance requires separate Central and State tax components |
| `Vendor.rating` as Float | Supports granular ratings (e.g., 4.5/5) for quotation comparison |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth` | Login or register (`action: "login" \| "register"`) |

### Vendors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vendors` | List vendors (supports `?status=` and `?search=` filters) |
| `POST` | `/api/vendors` | Create a new vendor |
| `GET` | `/api/vendors/[id]` | Get vendor details |
| `PUT` | `/api/vendors/[id]` | Update vendor |
| `DELETE` | `/api/vendors/[id]` | Delete vendor |

### RFQs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/rfqs` | List RFQs (supports `?status=` filter) |
| `POST` | `/api/rfqs` | Create RFQ with line items and vendor assignments |
| `GET` | `/api/rfqs/[id]` | Get RFQ with line items, vendors, and quotations |
| `PUT` | `/api/rfqs/[id]` | Update RFQ (publish, close, cancel) |

### Quotations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/quotations` | List quotations (supports `?rfqId=` and `?vendorId=` filters) |
| `POST` | `/api/quotations` | Submit a quotation with itemized pricing |
| `GET` | `/api/quotations/[id]` | Get quotation details with items |
| `PUT` | `/api/quotations/[id]` | Update quotation (submit, select, reject) |

### Approvals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/approvals` | List approvals (supports `?status=` filter) |
| `POST` | `/api/approvals` | Create approval workflow for a quotation |
| `GET` | `/api/approvals/[id]` | Get approval with steps |
| `PUT` | `/api/approvals/[id]` | Process approval step (approve/reject), auto-generates PO on final approval |

### Purchase Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/purchase-orders` | List purchase orders |
| `POST` | `/api/purchase-orders` | Create purchase order (usually auto-generated via approval) |
| `GET` | `/api/purchase-orders/[id]` | Get PO with items and vendor details |
| `PUT` | `/api/purchase-orders/[id]` | Update PO (mark as paid, update payment status) |

### Activity Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/activity-logs` | List logs (supports `?category=` filter) |
| `POST` | `/api/activity-logs` | Create an audit log entry |

### Dashboard & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Aggregated dashboard stats (KPIs, recent POs, spending by category) |
| `GET` | `/api/reports` | Analytics data (vendor performance, procurement trends, category spending, status breakdown) |

### Seed

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/seed` | Populate database with sample data |

---

## Screens

### 1. Login / Signup
Secure authentication with email and password. Toggle between sign-in and registration forms. Registration captures first/last name, email, phone, country, role selection, and additional information. A "Load Sample Data" button seeds the database for demo purposes.

### 2. Dashboard
At-a-glance overview showing four KPI metric cards (Active RFQs, Pending Approvals, POs This Month with total amount, Overdue Invoices), a recent purchase orders table, a spending-by-category donut chart, and quick-action buttons for creating RFQs, adding vendors, and viewing invoices.

### 3. Vendor Management
Full CRUD interface for supplier profiles. Search by name, registration number, or category. Filter tabs show counts for All, Active, Pending, and Blocked vendors. The "Add Vendor" dialog captures company name, category, GST number, contact number, email, address, and status. The "View" button opens a detail dialog with all vendor information and star ratings.

### 4. RFQ Creation
Three-step creation wizard for new Requests for Quotation. Step 1 captures the RFQ title, category, deadline, and description. Step 2 manages line items (item name, quantity, unit) with add/remove capability. Step 3 assigns vendors from the existing vendor list and provides file attachment capability. Actions include "Save & Send to Vendors" (publishes RFQ) and "Save as Draft."

### 5. Quotation Submission
Vendor-facing form that displays the RFQ summary and allows vendors to submit itemized quotations. Each line item requires unit price and delivery days. The form auto-calculates subtotal, GST amount, and grand total. Includes a payment terms field and options to "Submit Quotation" or "Save Draft."

### 6. Quotation Comparison
Side-by-side comparison of all submitted quotations for an RFQ. The comparison table shows price, GST percentage, delivery days, vendor rating, and payment terms for each vendor. The lowest-price vendor is automatically highlighted in green. Selecting a vendor initiates the approval workflow.

### 7. Approval Workflow
Visual four-step workflow tracker (Submitted → L1 Review → L2 Approval → Generate PO) with the current step highlighted. Displays the approval chain showing each approver's name, status (Approved/Pending), and timestamp. Approvers can approve or reject with comments. Final approval auto-generates a Purchase Order.

### 8. Purchase Orders
List view of all purchase orders with PO number, vendor, amount, dates, and payment status badges (Paid/Pending/Overdue). Detail view shows full PO information including bill-to and vendor addresses with GSTINs, itemized table, and CGST/SGST tax breakdown. Includes a "Mark as Paid" action for pending/overdue orders.

### 9. Invoices
Dedicated invoice management page with INV- prefixed invoice numbers, search by PO number or vendor name, and filter tabs by payment status (All/Pending/Paid/Overdue). Invoice detail view provides a formal tax invoice layout with Download PDF, Print, and Email Invoice actions. Shows complete financial breakdown including CGST and SGST components.

### 10. Activity Logs
Immutable audit trail recording every procurement action. Filter by category (All, RFQ, Approvals, Invoices, Vendors). Each entry includes an action icon, description, user attribution, and timestamp. The schema enforces write-once immutability — log records cannot be edited or deleted.

### 11. Reports & Analytics
Comprehensive analytics dashboard with three summary cards (Total Spend, Average PO Value, Active Vendors), a monthly procurement trends line chart, a spending-by-category bar chart, vendor performance table (rating, quotations, POs, revenue), and RFQ/approval status pie charts. Includes an "Export Report" button.

---

## User Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Admin** | Full system access — manage users, vendors, view all analytics, configure settings |
| **Procurement Officer** | Create RFQs, compare quotations, select vendors, generate purchase orders and invoices |
| **Vendor** | Submit quotations against assigned RFQs, track RFQ status, view purchase orders |
| **Manager / Approver** | Approve or reject procurement requests, monitor approval workflows, add comments |

---

## Procurement Workflow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  1. Create   │────>│  2. Vendors   │────>│  3. Compare      │────>│ 4. Initiate   │
│     RFQ      │     │  Submit Quotes│     │     Quotes       │     │   Approval    │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────────┘
                                                                       │
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐          │
│  7. Track    │<────│  6. Generate  │<────│  5. Multi-Level  │<─────────┘
│   Activity   │     │    Invoice   │     │    Approvals     │
└─────────────┘     └──────────────┘     └─────────────────┘
```

1. **Procurement Officer** creates an RFQ with line items and assigns vendors
2. **Vendors** receive the RFQ and submit itemized quotations with pricing and delivery
3. **Procurement team** compares quotations side-by-side; lowest price is highlighted
4. Selecting a vendor automatically **initiates the approval workflow**
5. **Managers/Approvers** review and approve through L1 and L2 levels
6. Upon final approval, a **Purchase Order** is auto-generated with GST breakdown
7. An **Invoice** is generated from the PO; it can be downloaded as PDF, printed, or emailed
8. All actions are recorded in the **immutable Activity Log** for audit compliance

---

## Seed Data & Demo Accounts

Click **"Load Sample Data"** on the login page, or send a `POST` request to `/api/seed` to populate the database with realistic Indian business context data:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | `admin@vendorbridge.com` | `password123` | Admin |
| Procurement Officer | `officer@vendorbridge.com` | `password123` | Procurement Officer |
| Vendor | `vendor@vendorbridge.com` | `password123` | Vendor |
| Manager | `manager@vendorbridge.com` | `password123` | Manager/Approver |

### Sample Data Includes

- **8 vendors** across IT, Construction, Logistics, Furniture, and Electrical categories
- **5 RFQs** in various statuses (draft, published, closed)
- **6 quotations** from multiple vendors with itemized pricing
- **2 approvals** in pending/l1_approved states
- **3 purchase orders** with paid, pending, and overdue payment statuses
- **15+ activity log** entries covering the full procurement lifecycle
- All data uses Indian business context (GST numbers, INR currency, Indian company names and cities)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database connection string | `file:./db/custom.db` |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint checks |
| `bun run db:push` | Push Prisma schema changes to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Create and apply database migration |
| `bun run db:reset` | Reset database and re-apply migrations |

---

## License

This project is private and proprietary.
