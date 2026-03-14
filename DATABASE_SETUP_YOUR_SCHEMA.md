# Database Setup - Using Your Schema

## ✅ Use Your Provided Schema

You already have a complete database schema that includes everything needed. **Use your schema, not the one I created.**

Your schema includes:
- All 17 tables with proper relationships
- RLS policies configured
- Triggers and functions
- Indexes for performance
- Realtime publication setup
- Sample data generation

## Setup Steps

### 1. Run Your Schema

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy your entire schema (the one you provided)
4. Paste and click "Run"
5. Wait for success message

### 2. Enable Realtime

1. Go to Database → Replication
2. Find `orders` table
3. Toggle "Enable Replication" ON
4. Save changes

### 3. Verify Tables Created

Check these tables exist:
- cafes
- profiles
- categories
- menu_items
- variants
- add_ons
- orders
- order_items
- payments
- pickup_slots
- slot_availability
- coupons
- coupon_uses
- favorites
- notifications
- push_subscriptions
- banners

### 4. Check Sample Data

Your schema includes a sample cafe with ID: `2bc52bee-2b67-4c82-8558-4f4e76761113`

Verify it exists:
```sql
SELECT * FROM cafes WHERE id = '2bc52bee-2b67-4c82-8558-4f4e76761113';
```

### 5. Create Admin User

1. Sign up at `/auth/sign-up`
2. Get your user ID from Supabase Auth
3. Run:

```sql
UPDATE profiles 
SET role = 'admin', 
    cafe_id = '2bc52bee-2b67-4c82-8558-4f4e76761113'
WHERE id = 'YOUR_USER_ID';
```

## Differences from My Schema

Your schema has some additional features:
- ✅ Coupon usage tracking table
- ✅ Favorites table
- ✅ Push subscriptions table
- ✅ Banners table
- ✅ Auto-generate order numbers per cafe
- ✅ Pickup slots with 15-min intervals pre-seeded

All backend code I created works with your schema!

## Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay (Optional for demo)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## Verification Checklist

- [ ] All tables created
- [ ] RLS policies active
- [ ] Triggers working
- [ ] Functions created
- [ ] Realtime enabled for `orders`
- [ ] Sample cafe exists
- [ ] Admin user created
- [ ] Can login successfully

## Next Steps

1. Add menu items to database
2. Test order creation
3. Test admin dashboard
4. Verify real-time updates

Your schema is production-ready! 🚀
