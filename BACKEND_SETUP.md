# Backend Integration Setup Guide

## What's Been Built

### 1. API Routes (Complete Order Flow)

#### Order Management
- `POST /api/orders` - Create new order from cart
- `GET /api/orders` - Get user's order history
- `GET /api/orders/[id]` - Get single order details with real-time updates

#### Admin Order Management
- `GET /api/admin/orders` - Get all orders (admin only)
- `PATCH /api/admin/orders/[id]/status` - Update order status (accept/reject/preparing/ready)

#### Payment Integration
- `POST /api/payments/create` - Create Razorpay order
- `POST /api/payments/verify` - Verify Razorpay payment signature

#### Menu API
- `GET /api/menu/categories` - Get all active categories
- `GET /api/menu/items` - Get menu items (with optional category filter)

#### Slot Management
- `GET /api/slots/available` - Get available pickup slots for a date

### 2. Real-time Features

#### User Side
- **Order Tracking Page** (`/orders/[id]`)
  - Live status updates using Supabase Realtime
  - Progress bar showing order journey
  - Automatic updates when admin changes status
  
- **Orders List** (`/orders`)
  - View all past and current orders
  - Quick status overview
  - Click to track individual orders

#### Admin Side
- **Live Order Dashboard** (Updated `AdminOrdersLive.tsx`)
  - Real-time new order notifications
  - Accept/Reject orders with reason
  - Update status: Confirmed → Preparing → Ready → Completed
  - Automatic user notifications on status change

### 3. Payment Integration

- Razorpay checkout integrated in billing page
- Payment verification with signature validation
- Support for cash payments
- Automatic order status updates on payment

### 4. Order Flow

```
USER PLACES ORDER
    ↓
Order Created (status: pending)
    ↓
ADMIN SEES NEW ORDER (real-time)
    ↓
Admin Accepts → Status: confirmed
    ↓
Admin Starts Preparing → Status: preparing
    ↓
Admin Marks Ready → Status: ready
    ↓
User Picks Up → Admin Marks Completed
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 2. Database Setup

You need to create these tables in Supabase (based on your `types/index.ts`):

#### Core Tables
- `cafes` - Cafe information and settings
- `profiles` - User profiles with roles
- `categories` - Menu categories
- `menu_items` - Menu items with pricing
- `variants` - Item variants
- `add_ons` - Item add-ons
- `orders` - Order records
- `order_items` - Order line items
- `payments` - Payment records
- `pickup_slots` - Available pickup time slots
- `slot_availability` - Daily slot availability
- `coupons` - Discount coupons
- `app_notifications` - User notifications

#### Required Database Functions

Create these PostgreSQL functions in Supabase:

```sql
-- Increment coupon usage count
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE coupons 
  SET used_count = used_count + 1 
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Increment slot booking count
CREATE OR REPLACE FUNCTION increment_slot_booking(p_slot_id uuid, p_slot_date date)
RETURNS void AS $$
BEGIN
  UPDATE slot_availability 
  SET booked_count = booked_count + 1 
  WHERE slot_id = p_slot_id AND slot_date = p_slot_date;
END;
$$ LANGUAGE plpgsql;

-- Release slot when order is cancelled
CREATE OR REPLACE FUNCTION release_slot(p_slot_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE slot_availability 
  SET booked_count = GREATEST(0, booked_count - 1) 
  WHERE slot_id = p_slot_id;
END;
$$ LANGUAGE plpgsql;
```

#### Enable Realtime

Enable Realtime for the `orders` table in Supabase:

1. Go to Database → Replication
2. Enable replication for `orders` table
3. This allows real-time updates for order tracking

### 3. Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get your API keys from Dashboard → Settings → API Keys
3. Add keys to `.env.local`
4. Test mode keys work for development

### 4. Initial Data

You need at least one cafe in the database:

```sql
INSERT INTO cafes (id, name, slug, is_active, settings)
VALUES (
  gen_random_uuid(),
  'Tech Cafe',
  'tech-cafe',
  true,
  '{
    "opening_hours": {"open": "08:00", "close": "20:00"},
    "slot_duration_mins": 30,
    "max_orders_per_slot": 10,
    "tax_percentage": 5,
    "currency": "INR"
  }'::jsonb
);
```

## Testing the Flow

### User Flow
1. Browse menu at `/categorysection`
2. Add items to cart
3. Go to billing page
4. Select payment method
5. Place order
6. Track order at `/orders/[id]`
7. See real-time status updates

### Admin Flow
1. Login as admin
2. Go to `/admin`
3. See new orders appear in real-time
4. Accept order (status → confirmed)
5. Mark as preparing
6. Mark as ready
7. User sees updates instantly

## API Endpoints Reference

### Public Endpoints
- `GET /api/menu/categories` - List categories
- `GET /api/menu/items?categoryId=X` - List items
- `GET /api/slots/available?date=YYYY-MM-DD` - Available slots

### Authenticated Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders` - User's orders
- `GET /api/orders/[id]` - Order details
- `POST /api/payments/create` - Create payment
- `POST /api/payments/verify` - Verify payment

### Admin Endpoints
- `GET /api/admin/orders` - All orders
- `PATCH /api/admin/orders/[id]/status` - Update status

## What's Next

### Phase 2 Features (Not Yet Implemented)
- Cart persistence in database
- Coupon validation UI
- Push notifications
- Order cancellation by user
- Refund processing
- Admin menu CRUD operations
- Advanced analytics

### Known Limitations
1. Cart is still client-side only (not persisted)
2. Menu items are hardcoded in `menu.tsx` (need to fetch from API)
3. No push notifications yet
4. No order cancellation by users
5. Slot management UI not built

## Troubleshooting

### Orders not appearing in admin dashboard
- Check if Realtime is enabled for `orders` table
- Verify cafe_id matches between user profile and orders

### Payment verification fails
- Check Razorpay secret key is correct
- Verify webhook signature validation

### Real-time updates not working
- Ensure Supabase Realtime is enabled
- Check browser console for WebSocket errors
- Verify RLS policies allow reading orders

## Security Notes

1. All API routes check authentication
2. Admin routes verify role before allowing access
3. Payment signatures are verified server-side
4. RLS policies should be configured in Supabase
5. Never expose service role key to client

## Support

For issues or questions:
1. Check Supabase logs for database errors
2. Check browser console for client errors
3. Check server logs for API errors
4. Verify environment variables are set correctly
