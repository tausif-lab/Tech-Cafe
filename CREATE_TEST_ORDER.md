# Create Test Order for Admin Panel

Since you don't have any orders yet, here's how to create a test order to see the admin order management buttons:

## Option 1: Place an Order Through the App (Recommended)

1. **Go to the user side**: Navigate to `/categorysection` or `/home`
2. **Add items to cart**: Click on menu items and add them to your cart
3. **Go to billing**: Click the cart icon in the navbar
4. **Place order**: Fill in the details and click "Place Order"
5. **Check admin panel**: Go to `/admin/orders` and you'll see the new order with Accept/Reject buttons

## Option 2: Create Test Order via SQL (Quick Test)

Run this SQL in your Supabase SQL Editor:

```sql
-- First, get your cafe_id and user_id
SELECT id as user_id FROM auth.users LIMIT 1;
SELECT cafe_id FROM profiles WHERE role IN ('admin', 'superadmin') LIMIT 1;

-- Then create a test order (replace YOUR_USER_ID and YOUR_CAFE_ID)
INSERT INTO orders (
  user_id,
  cafe_id,
  order_number,
  order_type,
  status,
  payment_status,
  total_amount,
  slot_date,
  slot_time
) VALUES (
  'YOUR_USER_ID',
  'YOUR_CAFE_ID',
  'ORD-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  'takeaway',
  'pending',
  'pending',
  250.00,
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00'
) RETURNING id;

-- Add order items (replace ORDER_ID from above)
INSERT INTO order_items (
  order_id,
  item_name,
  quantity,
  unit_price,
  total_price
) VALUES 
  ('ORDER_ID', 'Test Sandwich', 2, 100.00, 200.00),
  ('ORDER_ID', 'Coffee', 1, 50.00, 50.00);
```

## What You'll See After Creating an Order:

### For PENDING Orders:
- **Green "Accept Order" button** - Click to confirm the order
- **Red "Reject Order" button** - Click to cancel with a reason

### After Accepting (CONFIRMED status):
- **Blue "Start Preparing" button** - Click when you start making the order

### After Starting (PREPARING status):
- **Green "Mark Ready" button** - Click when order is ready for pickup

### After Ready (READY status):
- **Gray "Mark Completed" button** - Click when customer picks up

## Order Status Flow:
```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
   ↓
CANCELLED (if rejected)
```

## Real-time Updates:
- Orders appear instantly on the admin panel when customers place them
- No page refresh needed - uses Supabase Realtime
- Customer gets notifications at each status change

## Troubleshooting:

If you still don't see orders:
1. Check that you're logged in as an admin user
2. Verify your profile has `role = 'admin'` or `'superadmin'`
3. Check browser console for any errors
4. Make sure the order's `cafe_id` matches your profile's `cafe_id`
