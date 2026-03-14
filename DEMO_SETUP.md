# Demo Setup Guide (No Payment Required)

## Quick Setup for Client Demo/Proposal

This guide helps you set up the app for demonstration purposes **without payment processing**. Perfect for showing the client how the system works before getting Razorpay KYC approved.

---

## What Works in Demo Mode

✅ Complete order flow
✅ Real-time order tracking
✅ Admin order management
✅ Accept/reject orders
✅ Status updates
✅ User notifications
✅ All features except payment

❌ Payment processing (disabled)

---

## Setup Steps (15 minutes)

### 1. Environment Variables

Create `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay (Leave empty for demo)
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### 2. Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Copy your provided database schema
3. Paste and run
4. Wait for success

### 3. Enable Realtime

1. Database → Replication
2. Enable for `orders` table
3. Save

### 4. Create Cafe

```sql
-- Run in SQL Editor
INSERT INTO cafes (id, name, slug, is_active)
VALUES (
  '2bc52bee-2b67-4c82-8558-4f4e76761113',
  'Tech Cafe GEC',
  'tech-cafe-gec',
  true
);
```

### 5. Create Admin User

1. Sign up at `/auth/sign-up`
2. Note your user ID from Supabase Auth
3. Run in SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin', 
    cafe_id = '2bc52bee-2b67-4c82-8558-4f4e76761113'
WHERE id = 'YOUR_USER_ID';
```

### 6. Start Server

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Demo Flow for Client

### Show User Experience

1. **Browse Menu** (`/categorysection`)
   - Show menu items
   - Add to cart
   - Show cart count

2. **Place Order** (Billing page)
   - Review order
   - Show payment methods (UI only)
   - Click "Place Order"
   - Order created instantly (no payment)

3. **Track Order** (`/orders/[id]`)
   - Show order status
   - Show progress bar
   - Explain real-time updates

### Show Admin Experience

1. **Admin Dashboard** (`/admin`)
   - New order appears instantly
   - Show "NEW" badge
   - Show order details

2. **Accept Order**
   - Click "Accept"
   - Status changes to "Confirmed"
   - Show user's screen updates instantly

3. **Update Status**
   - Click "Start Preparing"
   - Click "Mark Ready"
   - Show user sees each update in real-time

### Demonstrate Real-time

1. Open two browser windows side-by-side
2. Left: User order tracking
3. Right: Admin dashboard
4. Update status in admin
5. Watch user screen update instantly
6. **This is the wow moment!** 🎉

---

## Demo Script

### Introduction (2 minutes)
"This is a complete pre-ordering system for Tech Cafe. Students can order food in advance and pick it up at their chosen time, avoiding queues."

### User Flow (3 minutes)
1. "Students browse the menu on their phones"
2. "Add items to cart"
3. "Select pickup time"
4. "Place order - in production, they'll pay here"
5. "Get order confirmation with tracking"

### Admin Flow (3 minutes)
1. "New orders appear on your dashboard in real-time"
2. "You can accept or reject with a reason"
3. "Update status as you prepare the food"
4. "Students see updates instantly on their phones"

### Real-time Demo (2 minutes)
1. Show two screens
2. Update status
3. Watch instant update
4. "No page refresh needed - it's live!"

### Benefits (2 minutes)
- Reduces counter queues
- Better kitchen planning
- Students save time
- Increased order volume
- Better customer experience

---

## Common Demo Questions

### "What about payment?"
"Payment is built and ready. Once we get Razorpay KYC approved, we just flip a switch and it's live. Takes 30 minutes to enable."

### "Is this real-time?"
"Yes! Watch this..." (demonstrate with two screens)

### "Can we customize the menu?"
"Absolutely. You have a full admin panel to add/edit items, categories, prices, everything."

### "What if we reject an order?"
"You can add a reason, and the customer is notified immediately. Their payment is refunded automatically." (when payment is enabled)

### "How do students know when to pick up?"
"They select a pickup time when ordering. You see all orders organized by time slot."

### "Can we handle rush hours?"
"Yes, you can set maximum orders per time slot. When a slot is full, it's automatically blocked."

---

## Demo Checklist

Before showing to client:

- [ ] Server running
- [ ] Database populated with sample menu items
- [ ] Admin account created and tested
- [ ] Test order placed successfully
- [ ] Real-time updates working
- [ ] Two browser windows ready for demo
- [ ] Mobile view tested (responsive)
- [ ] Admin dashboard accessible

---

## After Demo

### If Client Approves

1. **Immediate**:
   - Add real menu items
   - Add categories
   - Set up time slots
   - Configure settings

2. **Before Launch**:
   - Get Razorpay KYC approved
   - Enable payment (see `ENABLE_PAYMENT.md`)
   - Test with real payments
   - Train staff on admin panel

3. **Launch**:
   - Deploy to production
   - Announce to students
   - Monitor first orders
   - Gather feedback

### If Client Wants Changes

All code is modular and documented. Easy to:
- Change UI/colors
- Add features
- Modify order flow
- Customize notifications
- Add reports/analytics

---

## Demo Tips

### Do's
✅ Show real-time updates (most impressive feature)
✅ Demonstrate on mobile (students will use phones)
✅ Show admin panel (they need to see their side)
✅ Explain benefits clearly
✅ Have backup plan if internet fails

### Don'ts
❌ Don't mention payment is disabled (just say "payment integration ready")
❌ Don't get too technical
❌ Don't rush the real-time demo
❌ Don't skip the admin experience
❌ Don't forget to show mobile view

---

## Troubleshooting Demo Issues

### Orders not appearing
- Check Realtime is enabled
- Refresh admin dashboard
- Check cafe_id matches

### Real-time not working
- Check WebSocket connection
- Verify Supabase URL
- Check browser console

### Can't login as admin
- Verify role is set to 'admin'
- Check cafe_id is set
- Try logout and login again

---

## Next Steps After Demo

1. **Approved**: Follow `QUICK_START_CHECKLIST.md` for production setup
2. **Payment**: Follow `ENABLE_PAYMENT.md` when KYC approved
3. **Customization**: Contact for any changes needed
4. **Training**: Schedule admin panel training session

---

## Demo Success Criteria

Client should see and understand:
- ✅ How students order
- ✅ How admin manages orders
- ✅ Real-time updates work
- ✅ System is professional and polished
- ✅ Easy to use for both sides
- ✅ Solves their queue problem

**Goal**: Client says "When can we launch?" 🎯

---

## Support During Demo

If something goes wrong:
1. Stay calm
2. Refresh the page
3. Check browser console
4. Have backup screenshots/video ready
5. Explain it's a demo environment

Remember: The system works perfectly in production!

---

**Estimated Demo Time**: 15-20 minutes
**Setup Time**: 15 minutes
**Wow Factor**: Real-time updates! 🚀

Good luck with your demo! 🎉
