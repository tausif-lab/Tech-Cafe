# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Menu Page  │  │ Billing Page │  │ Order Track  │          │
│  │ /category... │  │   /billing   │  │  /orders/[id]│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Orders API   │  │ Payments API │  │  Menu API    │          │
│  │ /api/orders  │  │ /api/payments│  │  /api/menu   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  Admin API   │  │  Slots API   │                            │
│  │ /api/admin   │  │  /api/slots  │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend Services)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │   Auth JWT   │  │   Realtime   │          │
│  │   Database   │  │ Authentication│  │  WebSocket   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐                                               │
│  │   Razorpay   │  Payment Processing                           │
│  │   Gateway    │  Signature Verification                       │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Order Flow Sequence

```
USER                    API                 DATABASE            ADMIN
  │                      │                      │                 │
  │  1. Place Order      │                      │                 │
  ├─────────────────────>│                      │                 │
  │                      │  2. Create Order     │                 │
  │                      ├─────────────────────>│                 │
  │                      │                      │  3. New Order   │
  │                      │                      ├────────────────>│
  │  4. Order Created    │                      │                 │
  │<─────────────────────┤                      │                 │
  │                      │                      │                 │
  │  5. Track Order      │                      │                 │
  ├─────────────────────>│                      │                 │
  │                      │  6. Subscribe        │                 │
  │                      ├─────────────────────>│                 │
  │                      │                      │                 │
  │                      │                      │  7. Accept      │
  │                      │                      │<────────────────┤
  │                      │  8. Status Update    │                 │
  │                      │<─────────────────────┤                 │
  │  9. Real-time Update │                      │                 │
  │<─────────────────────┤                      │                 │
  │                      │                      │                 │
  │                      │                      │  10. Preparing  │
  │                      │                      │<────────────────┤
  │  11. Status Update   │                      │                 │
  │<─────────────────────┤                      │                 │
  │                      │                      │                 │
  │                      │                      │  12. Ready      │
  │                      │                      │<────────────────┤
  │  13. Status Update   │                      │                 │
  │<─────────────────────┤                      │                 │
  │                      │                      │                 │
  │  14. Pick Up         │                      │                 │
  │                      │                      │                 │
```

## Payment Flow

```
USER                    API                 RAZORPAY           DATABASE
  │                      │                      │                 │
  │  1. Place Order      │                      │                 │
  ├─────────────────────>│                      │                 │
  │                      │  2. Create Order     │                 │
  │                      ├──────────────────────┼────────────────>│
  │                      │                      │                 │
  │                      │  3. Create Payment   │                 │
  │                      ├─────────────────────>│                 │
  │                      │  4. Order ID         │                 │
  │                      │<─────────────────────┤                 │
  │                      │                      │                 │
  │  5. Razorpay Modal   │                      │                 │
  │<─────────────────────┤                      │                 │
  │                      │                      │                 │
  │  6. Enter Payment    │                      │                 │
  ├──────────────────────┼─────────────────────>│                 │
  │                      │                      │                 │
  │  7. Payment Success  │                      │                 │
  │<─────────────────────┼──────────────────────┤                 │
  │                      │                      │                 │
  │  8. Verify Signature │                      │                 │
  ├─────────────────────>│                      │                 │
  │                      │  9. Validate         │                 │
  │                      │  Signature           │                 │
  │                      │                      │                 │
  │                      │  10. Update Status   │                 │
  │                      ├──────────────────────┼────────────────>│
  │                      │                      │                 │
  │  11. Success         │                      │                 │
  │<─────────────────────┤                      │                 │
  │                      │                      │                 │
```

## Real-time Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN UPDATES ORDER STATUS                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PATCH /api/admin/orders/[id]/status                 │
│                    (Admin API Route)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UPDATE orders SET status = ?                    │
│                    (Database Update)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE REALTIME BROADCAST                         │
│           (WebSocket to all subscribed clients)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              USER'S BROWSER RECEIVES UPDATE                      │
│            (Order tracking page listening)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI UPDATES INSTANTLY                          │
│         (Progress bar, status badge, timestamp)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌──────────┐
│  cafes   │
└────┬─────┘
     │
     ├─────────────────────────────────────────────┐
     │                                             │
     ▼                                             ▼
┌──────────┐                                  ┌──────────┐
│ profiles │                                  │categories│
└────┬─────┘                                  └────┬─────┘
     │                                             │
     │                                             ▼
     │                                        ┌──────────┐
     │                                        │menu_items│
     │                                        └────┬─────┘
     │                                             │
     │                                    ┌────────┴────────┐
     │                                    ▼                 ▼
     │                               ┌──────────┐     ┌──────────┐
     │                               │ variants │     │ add_ons  │
     │                               └──────────┘     └──────────┘
     │
     ▼
┌──────────┐
│  orders  │
└────┬─────┘
     │
     ├─────────────────────────────────────────────┐
     │                                             │
     ▼                                             ▼
┌──────────┐                                  ┌──────────┐
│order_items│                                 │ payments │
└──────────┘                                  └──────────┘
```

## API Route Structure

```
app/api/
│
├── orders/
│   ├── route.ts
│   │   ├── POST   → Create order
│   │   └── GET    → List user's orders
│   │
│   └── [id]/
│       └── route.ts
│           └── GET → Get order details
│
├── admin/
│   └── orders/
│       ├── route.ts
│       │   └── GET → List all orders (admin)
│       │
│       └── [id]/
│           └── status/
│               └── route.ts
│                   └── PATCH → Update order status
│
├── payments/
│   ├── create/
│   │   └── route.ts
│   │       └── POST → Create Razorpay order
│   │
│   └── verify/
│       └── route.ts
│           └── POST → Verify payment signature
│
├── menu/
│   ├── categories/
│   │   └── route.ts
│   │       └── GET → List categories
│   │
│   └── items/
│       └── route.ts
│           └── GET → List menu items
│
└── slots/
    └── available/
        └── route.ts
            └── GET → Get available slots
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SIGNS UP                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH CREATES USER                    │
│                    (auth.users table)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CALLBACK CREATES PROFILE                        │
│              (profiles table with role: customer)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      JWT TOKEN ISSUED                            │
│                  (Stored in secure cookie)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   USER MAKES API REQUEST                         │
│              (JWT token sent in Authorization)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTE VALIDATES TOKEN                     │
│                  (Checks user exists & role)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST PROCESSED                             │
│              (RLS policies enforce access)                       │
└─────────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                         LAYER 1: FRONTEND                        │
│  • Client-side validation                                        │
│  • UI-level access control                                       │
│  • Secure cookie storage                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LAYER 2: MIDDLEWARE                         │
│  • Route protection                                              │
│  • Session validation                                            │
│  • Token refresh                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LAYER 3: API ROUTES                        │
│  • Authentication check                                          │
│  • Role verification                                             │
│  • Input validation                                              │
│  • Business logic                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LAYER 4: DATABASE                          │
│  • Row Level Security (RLS)                                      │
│  • User-specific policies                                        │
│  • Admin-only policies                                           │
│  • Data encryption                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Complete Order Journey

```
1. USER BROWSES MENU
   ↓
2. ADDS ITEMS TO CART (Client State)
   ↓
3. GOES TO BILLING PAGE
   ↓
4. SELECTS PAYMENT METHOD
   ↓
5. CLICKS "PLACE ORDER"
   ↓
6. API: POST /api/orders
   ├─ Validates user authentication
   ├─ Calculates totals (subtotal, tax, discount)
   ├─ Creates order record (status: pending)
   ├─ Creates order_items records
   └─ Returns order ID
   ↓
7. IF RAZORPAY:
   ├─ API: POST /api/payments/create
   ├─ Creates Razorpay order
   ├─ Opens Razorpay checkout modal
   ├─ User completes payment
   ├─ API: POST /api/payments/verify
   ├─ Verifies signature
   └─ Updates payment_status: paid
   ↓
8. USER REDIRECTED TO /orders/[id]
   ├─ Subscribes to order updates (Realtime)
   └─ Shows current status
   ↓
9. ADMIN SEES NEW ORDER (Real-time)
   ├─ Order appears in dashboard
   └─ Shows "NEW" badge
   ↓
10. ADMIN ACCEPTS ORDER
    ├─ API: PATCH /api/admin/orders/[id]/status
    ├─ Updates status: confirmed
    ├─ Creates notification
    └─ Broadcasts via Realtime
    ↓
11. USER SEES UPDATE (Instant)
    ├─ Status changes to "Confirmed"
    ├─ Progress bar updates
    └─ Timestamp updates
    ↓
12. ADMIN UPDATES: preparing → ready
    └─ User sees each update instantly
    ↓
13. USER PICKS UP ORDER
    ↓
14. ADMIN MARKS: completed
    └─ Order journey complete
```

## Component Hierarchy

```
App
├── Layout (Root)
│   ├── Providers (Cart Context)
│   └── Razorpay Script
│
├── Public Routes
│   ├── Home (/)
│   ├── Menu (/categorysection)
│   └── Auth (/auth/login, /auth/sign-up)
│
├── Protected Routes (User)
│   ├── Orders List (/orders)
│   ├── Order Tracking (/orders/[id])
│   │   └── Real-time Subscription
│   ├── Billing (/billing)
│   │   └── Payment Integration
│   └── Account (/Accountpage)
│
└── Admin Routes (/admin)
    ├── Admin Layout
    │   └── Admin Sidebar
    ├── Dashboard (/admin)
    │   └── AdminOrdersLive
    │       └── Real-time Subscription
    ├── Menu Management (/admin/menu)
    ├── Coupons (/admin/coupons)
    └── Reports (/admin/reports)
```

This architecture provides a scalable, secure, and real-time order management system for your Tech Cafe application.
