# Troubleshooting Guide

## Common Issues and Solutions

### 1. Orders Not Appearing in Admin Dashboard

#### Symptoms
- User places order successfully
- Admin dashboard shows no new orders
- Order exists in database

#### Possible Causes & Solutions

**A. Realtime Not Enabled**
```
Solution:
1. Go to Supabase Dashboard
2. Navigate to Database → Replication
3. Find 'orders' table
4. Toggle "Enable Replication" ON
5. Save changes
```

**B. Cafe ID Mismatch**
```sql
-- Check user's cafe_id
SELECT id, cafe_id, role FROM profiles WHERE id = 'USER_ID';

-- Check order's cafe_id
SELECT id, cafe_id, user_id FROM orders WHERE id = 'ORDER_ID';

-- Fix: Update user's cafe_id
UPDATE profiles SET cafe_id = 'CORRECT_CAFE_ID' WHERE id = 'USER_ID';
```

**C. RLS Policy Issue**
```sql
-- Check if admin can see orders
SELECT * FROM orders WHERE cafe_id = 'CAFE_ID';

-- If empty, check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

**D. WebSocket Connection Failed**
```
Check browser console for:
- "WebSocket connection failed"
- "Realtime subscription error"

Solution:
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Check network tab for WebSocket connection
3. Ensure no firewall blocking WebSocket
```

---

### 2. Real-time Updates Not Working

#### Symptoms
- Admin updates order status
- User's tracking page doesn't update
- Need to refresh page to see changes

#### Solutions

**A. Check Realtime Subscription**
```typescript
// In browser console on tracking page
console.log('Checking subscription...')

// Should see WebSocket connection in Network tab
// Filter by "WS" to see WebSocket connections
```

**B. Verify Channel Name**
```typescript
// Make sure channel name matches
const channel = supabase
  .channel(`order-${orderId}`)  // Must match exactly
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `id=eq.${orderId}`  // Filter must be correct
  }, (payload) => {
    console.log('Received update:', payload)
  })
  .subscribe()
```

**C. Check Supabase Realtime Status**
```
1. Go to Supabase Dashboard
2. Check Project Status
3. Ensure Realtime is not paused
4. Check for any service disruptions
```

---

### 3. Payment Verification Fails

#### Symptoms
- Payment succeeds in Razorpay
- Verification fails in backend
- Order status remains "pending"

#### Solutions

**A. Check Razorpay Secret Key**
```env
# Verify in .env.local
RAZORPAY_KEY_SECRET=your_secret_key

# Make sure it matches Razorpay dashboard
# Settings → API Keys → Key Secret
```

**B. Signature Mismatch**
```typescript
// Check signature calculation
const body = razorpay_order_id + '|' + razorpay_payment_id
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  .update(body)
  .digest('hex')

console.log('Expected:', expectedSignature)
console.log('Received:', razorpay_signature)
```

**C. Test Mode vs Live Mode**
```
Ensure you're using matching keys:
- Test Key ID with Test Secret
- Live Key ID with Live Secret

Don't mix test and live keys!
```

---

### 4. "Unauthorized" Errors

#### Symptoms
- API returns 401 Unauthorized
- User is logged in
- Can't access protected routes

#### Solutions

**A. Check JWT Token**
```typescript
// In browser console
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Should show user and access_token
// If null, user needs to login again
```

**B. Token Expired**
```typescript
// Force token refresh
const { data: { session }, error } = await supabase.auth.refreshSession()
if (error) console.error('Refresh failed:', error)
```

**C. Cookie Issues**
```
1. Clear browser cookies
2. Logout and login again
3. Check if cookies are being set:
   - Open DevTools → Application → Cookies
   - Look for Supabase auth cookies
```

---

### 5. Admin Can't See Orders

#### Symptoms
- User has admin role
- Can access /admin route
- Orders list is empty

#### Solutions

**A. Verify Admin Role**
```sql
-- Check user's role
SELECT id, role, cafe_id FROM profiles WHERE id = 'USER_ID';

-- Should be 'admin' or 'superadmin'
-- If not, update:
UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID';
```

**B. Check Cafe ID**
```sql
-- Admin must have cafe_id set
UPDATE profiles 
SET cafe_id = (SELECT id FROM cafes LIMIT 1)
WHERE id = 'USER_ID';
```

**C. RLS Policy Check**
```sql
-- Test if admin can query orders
SELECT * FROM orders WHERE cafe_id = 'CAFE_ID';

-- If error, check RLS policies
-- May need to recreate admin policies
```

---

### 6. Cart Items Not Showing in Order

#### Symptoms
- Cart has items
- Order created successfully
- Order items table is empty

#### Solutions

**A. Check Cart Item Format**
```typescript
// Cart items must match this structure
const orderItems = items.map(item => ({
  id: crypto.randomUUID(),
  menu_item_id: item.menu_item_id,  // Must be valid UUID
  name: item.name,
  quantity: item.quantity,
  // ... other required fields
}))
```

**B. Verify Foreign Keys**
```sql
-- Check if menu_item_id exists
SELECT id FROM menu_items WHERE id = 'ITEM_ID';

-- If not found, item doesn't exist in database
```

---

### 7. Payment Modal Not Opening

#### Symptoms
- Click "Place Order"
- Razorpay modal doesn't appear
- Console shows errors

#### Solutions

**A. Check Razorpay Script**
```html
<!-- Verify script is loaded in layout -->
<script src="https://checkout.razorpay.com/v1/checkout.js" async></script>

<!-- Check in browser console -->
console.log(typeof window.Razorpay)  // Should be 'function'
```

**B. Check Key ID**
```typescript
// Verify key ID is set
console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)

// Should show your Razorpay key ID
// If undefined, check .env.local
```

**C. Browser Console Errors**
```
Look for:
- "Razorpay is not defined"
- "Invalid key_id"
- CORS errors

Solution: Ensure script loaded before opening modal
```

---

### 8. Database Connection Errors

#### Symptoms
- API returns 500 errors
- "Connection refused" in logs
- Database queries fail

#### Solutions

**A. Check Supabase URL**
```env
# Verify in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Should match Supabase dashboard
# Settings → API → Project URL
```

**B. Check Anon Key**
```env
# Verify anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Get from Supabase dashboard
# Settings → API → Project API keys → anon public
```

**C. Service Role Key**
```env
# For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Get from Supabase dashboard
# Settings → API → Project API keys → service_role
# ⚠️ Never expose this to client!
```

---

### 9. Slot Availability Issues

#### Symptoms
- No slots showing
- All slots appear full
- Can't select pickup time

#### Solutions

**A. Create Pickup Slots**
```sql
-- Insert default slots
INSERT INTO pickup_slots (cafe_id, slot_time, max_orders, is_active)
VALUES 
  ('CAFE_ID', '09:00:00', 10, true),
  ('CAFE_ID', '10:00:00', 10, true),
  ('CAFE_ID', '11:00:00', 10, true),
  ('CAFE_ID', '12:00:00', 10, true);
```

**B. Create Slot Availability**
```sql
-- Create availability for today
INSERT INTO slot_availability (cafe_id, slot_id, slot_date, slot_time, max_orders, booked_count)
SELECT 
  cafe_id, 
  id, 
  CURRENT_DATE, 
  slot_time, 
  max_orders, 
  0
FROM pickup_slots 
WHERE cafe_id = 'CAFE_ID' AND is_active = true;
```

---

### 10. Environment Variables Not Loading

#### Symptoms
- API returns "undefined" for env vars
- Features not working
- Console shows missing config

#### Solutions

**A. File Name**
```bash
# Must be exactly .env.local (not .env)
mv .env .env.local

# Restart dev server after creating
npm run dev
```

**B. Variable Prefix**
```env
# Client-side variables MUST start with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=...  ✅
SUPABASE_URL=...              ❌ (won't work on client)

# Server-only variables don't need prefix
RAZORPAY_KEY_SECRET=...       ✅
```

**C. Restart Server**
```bash
# Environment variables only load on server start
# After changing .env.local, restart:
Ctrl+C
npm run dev
```

---

## Debugging Tools

### 1. Check API Response
```typescript
// In browser console
const response = await fetch('/api/orders')
const data = await response.json()
console.log('API Response:', data)
```

### 2. Check Database Directly
```sql
-- In Supabase SQL Editor

-- Check orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Check order items
SELECT * FROM order_items WHERE order_id = 'ORDER_ID';

-- Check payments
SELECT * FROM payments WHERE order_id = 'ORDER_ID';

-- Check user profile
SELECT * FROM profiles WHERE id = 'USER_ID';
```

### 3. Check Realtime Connection
```typescript
// In browser console
const channel = supabase.channel('test')
channel.subscribe((status) => {
  console.log('Realtime status:', status)
})

// Should show: "SUBSCRIBED"
```

### 4. Check Authentication
```typescript
// In browser console
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Should show user object with id, email, etc.
```

---

## Error Messages Reference

### "No active cafe found"
```
Cause: No cafe record in database
Solution: Insert a cafe record
```

### "Unauthorized"
```
Cause: Not logged in or token expired
Solution: Login again or refresh token
```

### "Forbidden"
```
Cause: User doesn't have required role
Solution: Update user role to 'admin'
```

### "Order not found"
```
Cause: Order doesn't exist or user doesn't own it
Solution: Check order_id and user_id match
```

### "Invalid payment signature"
```
Cause: Razorpay signature verification failed
Solution: Check RAZORPAY_KEY_SECRET is correct
```

### "Slot not available"
```
Cause: Slot is full or doesn't exist
Solution: Create slot availability records
```

---

## Getting Help

### 1. Check Logs
- **Browser Console**: Client-side errors
- **Server Logs**: API errors (terminal)
- **Supabase Logs**: Database errors (dashboard)
- **Razorpay Dashboard**: Payment errors

### 2. Verify Setup
- [ ] Environment variables set
- [ ] Database schema created
- [ ] Realtime enabled
- [ ] RLS policies active
- [ ] Cafe record exists
- [ ] Admin role assigned

### 3. Test Endpoints
```bash
# Test menu API
curl http://localhost:3000/api/menu/categories

# Test orders API (need auth token)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/orders
```

### 4. Common Fixes
1. Restart dev server
2. Clear browser cache
3. Logout and login again
4. Check Supabase status
5. Verify environment variables
6. Check database records exist

---

## Still Having Issues?

1. Check all environment variables are set correctly
2. Verify database schema is complete
3. Ensure Realtime is enabled
4. Check browser console for errors
5. Check server logs for API errors
6. Verify RLS policies are correct
7. Test with a fresh browser session
8. Check Supabase project status

If issues persist, check:
- `BACKEND_SETUP.md` for setup instructions
- `INTEGRATION_COMPLETE.md` for architecture
- `QUICK_START_CHECKLIST.md` for step-by-step guide
