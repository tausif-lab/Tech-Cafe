# 🚀 Quick Start Checklist

## Prerequisites
- [ ] Node.js installed
- [ ] Supabase account created
- [ ] Razorpay account created (for payments)

## Step 1: Environment Setup (5 minutes)

### 1.1 Create `.env.local` file
```bash
cp .env.example .env.local
```

### 1.2 Add Supabase credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy these values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Add Razorpay credentials
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test Keys (for development)
4. Copy to `.env.local`:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

## Step 2: Database Setup (10 minutes)

### 2.1 Run database schema
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire contents of `database-schema.sql`
4. Paste and click "Run"
5. Wait for success message

### 2.2 Enable Realtime
1. Go to Database → Replication
2. Find `orders` table
3. Toggle "Enable Replication"
4. Save changes

### 2.3 Add sample cafe (Optional)
```sql
-- Run this in SQL Editor
INSERT INTO cafes (name, slug, description, is_active) 
VALUES ('Tech Cafe', 'tech-cafe', 'Campus cafe for students', true);
```

### 2.4 Create admin user
1. Sign up through your app at `/auth/sign-up`
2. Go to Supabase Dashboard → Authentication → Users
3. Find your user
4. Go to SQL Editor and run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

## Step 3: Install Dependencies (2 minutes)

```bash
npm install
```

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test User Flow (5 minutes)

### 5.1 Browse Menu
- [ ] Go to `/categorysection`
- [ ] See menu items (currently hardcoded)

### 5.2 Add to Cart
- [ ] Click "Add to Cart" on items
- [ ] See cart count increase

### 5.3 Place Order
- [ ] Go to billing page
- [ ] Review order
- [ ] Select payment method
- [ ] Click "Place Order"

### 5.4 Track Order
- [ ] Redirected to `/orders/[id]`
- [ ] See order status: "Pending"
- [ ] See progress bar

## Step 6: Test Admin Flow (5 minutes)

### 6.1 Login as Admin
- [ ] Logout if logged in as customer
- [ ] Login with admin account
- [ ] Go to `/admin`

### 6.2 See New Order
- [ ] New order appears in dashboard
- [ ] Shows "NEW" badge
- [ ] See order details

### 6.3 Accept Order
- [ ] Click "Accept" button
- [ ] Status changes to "Confirmed"
- [ ] Check user's tracking page - should update instantly!

### 6.4 Update Status
- [ ] Click "Start Preparing"
- [ ] Status changes to "Preparing"
- [ ] Click "Mark Ready"
- [ ] Status changes to "Ready"
- [ ] User sees all updates in real-time!

## Step 7: Test Real-time Updates (2 minutes)

### 7.1 Open Two Browser Windows
- Window 1: User order tracking page (`/orders/[id]`)
- Window 2: Admin dashboard (`/admin`)

### 7.2 Update Status in Admin
- [ ] Change order status in admin window
- [ ] Watch user window update instantly
- [ ] No page refresh needed!

## ✅ Verification Checklist

### Backend Working
- [ ] Orders API responding
- [ ] Admin API working
- [ ] Menu API returning data
- [ ] Payment creation working

### Real-time Working
- [ ] Order status updates instantly
- [ ] No page refresh needed
- [ ] WebSocket connected

### Payment Working
- [ ] Razorpay checkout opens
- [ ] Test payment succeeds
- [ ] Order status updates to "paid"

### Admin Working
- [ ] Can see all orders
- [ ] Can accept/reject orders
- [ ] Can update status
- [ ] Real-time updates working

## 🎉 Success Criteria

You're ready for production when:
1. ✅ User can place order
2. ✅ Admin sees order in real-time
3. ✅ Admin can accept/reject
4. ✅ User sees status updates instantly
5. ✅ Payment integration working
6. ✅ Order tracking page working

## 🐛 Common Issues

### Issue: Orders not appearing in admin
**Solution:**
- Check Realtime is enabled for `orders` table
- Verify cafe_id matches between user and orders
- Check RLS policies in Supabase

### Issue: Real-time updates not working
**Solution:**
- Enable Replication for `orders` table
- Check browser console for WebSocket errors
- Verify Supabase URL is correct

### Issue: Payment fails
**Solution:**
- Check Razorpay keys are correct
- Use Test Mode keys for development
- Verify RAZORPAY_KEY_SECRET is set

### Issue: "Unauthorized" errors
**Solution:**
- Check user is logged in
- Verify JWT token is valid
- Check RLS policies allow access

### Issue: Admin can't see orders
**Solution:**
- Verify user role is 'admin' or 'superadmin'
- Check cafe_id is set in profile
- Verify RLS policies for admin

## 📞 Need Help?

1. Check `BACKEND_SETUP.md` for detailed setup
2. Check `INTEGRATION_COMPLETE.md` for architecture
3. Check browser console for errors
4. Check Supabase logs for database errors
5. Check server logs for API errors

## 🎯 Next Steps After Setup

1. Add menu items to database
2. Update menu page to fetch from API
3. Add more categories
4. Test with real users
5. Configure production Razorpay keys
6. Deploy to production

## 📚 Documentation

- `BACKEND_SETUP.md` - Complete setup guide
- `INTEGRATION_COMPLETE.md` - Architecture overview
- `database-schema.sql` - Database schema
- `ADMIN_ACCESS_GUIDE.md` - Admin access instructions

---

**Estimated Total Time: 30 minutes**

Good luck! 🚀
