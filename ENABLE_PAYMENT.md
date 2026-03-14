# How to Enable Payment Processing

## Current Status: Payment Disabled ⚠️

The app is currently configured to work **without payment processing** for demo/proposal purposes. Orders are created directly without requiring payment.

## Why Payment is Disabled

- Razorpay requires KYC (Know Your Customer) verification
- KYC approval takes time and requires business documents
- For demo/proposal, we want to show the complete order flow without payment barriers

## When to Enable Payment

Enable payment processing when:
1. ✅ Razorpay KYC is approved
2. ✅ You have production API keys
3. ✅ You're ready to accept real payments
4. ✅ You've tested in Razorpay test mode

---

## Step-by-Step: Enable Payment

### Step 1: Get Razorpay KYC Approved

1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete KYC verification:
   - Business documents
   - Bank account details
   - Identity verification
3. Wait for approval (usually 24-48 hours)
4. Get production API keys

### Step 2: Update Environment Variables

```env
# Add to .env.local
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
```

⚠️ **Important**: Use `rzp_live_` keys for production, `rzp_test_` for testing

### Step 3: Enable Payment in Config

Open `lib/config.ts` and update:

```typescript
export const APP_CONFIG = {
  payment: {
    enabled: true,  // ← Change this to true
    
    methods: {
      razorpay: true,  // ← Enable Razorpay
      cash: true,      // Keep cash option
      pos: false
    }
  },
  // ... rest of config
}
```

### Step 4: Update Billing Page

Open `app/components/usermenu/Billingpage.tsx` and:

1. Find the commented section marked:
   ```typescript
   /* ═══════════════════════════════════════════════════════════
      RAZORPAY PAYMENT INTEGRATION (DISABLED FOR DEMO)
   ```

2. **Uncomment** the entire Razorpay integration code block

3. **Remove** or comment out the demo code:
   ```typescript
   // Remove these lines:
   await new Promise(r => setTimeout(r, 1000));
   setOrderPlaced(true);
   setLoading(false);
   ```

### Step 5: Test Payment Flow

1. **Test Mode First**:
   ```env
   # Use test keys
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_test_secret_key
   ```

2. **Place Test Order**:
   - Add items to cart
   - Go to billing
   - Select "UPI" or "Card"
   - Click "Place Order"
   - Razorpay modal should open

3. **Use Test Cards**:
   ```
   Card Number: 4111 1111 1111 1111
   CVV: Any 3 digits
   Expiry: Any future date
   ```

4. **Verify Payment**:
   - Check order status updates to "paid"
   - Check Razorpay dashboard for payment record
   - Check database `payments` table

### Step 6: Go Live

Once testing is successful:

1. Switch to production keys in `.env.local`
2. Restart server: `npm run dev`
3. Test with small real payment
4. Monitor Razorpay dashboard
5. Check order flow end-to-end

---

## Code Changes Required

### 1. Billing Page (`app/components/usermenu/Billingpage.tsx`)

**Current (Demo Mode):**
```typescript
// Create order (payment disabled for demo)
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: orderItems,
    paymentMethod: 'cash', // Always cash
    notes: null
  })
});

// Simulate processing
await new Promise(r => setTimeout(r, 1000));
setOrderPlaced(true);
```

**After Enabling Payment:**
```typescript
// Create order
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: orderItems,
    paymentMethod: selectedPayment === 'cash' ? 'cash' : 'razorpay',
    notes: null
  })
});

// If cash, skip payment
if (selectedPayment === 'cash') {
  setOrderPlaced(true);
  return;
}

// Otherwise, open Razorpay
const paymentResponse = await fetch('/api/payments/create', {
  method: 'POST',
  body: JSON.stringify({ orderId: newOrderId })
});

// ... Razorpay checkout code (already in file, just uncomment)
```

### 2. Config File (`lib/config.ts`)

**Current:**
```typescript
payment: {
  enabled: false,
  methods: {
    razorpay: false,
    cash: true,
    pos: false
  }
}
```

**After Enabling:**
```typescript
payment: {
  enabled: true,
  methods: {
    razorpay: true,
    cash: true,
    pos: false
  }
}
```

---

## Payment Flow (When Enabled)

```
User Places Order
    ↓
Order Created (status: pending, payment_status: pending)
    ↓
If Cash → Order Complete
    ↓
If Razorpay:
    ↓
Create Razorpay Order
    ↓
Open Razorpay Checkout Modal
    ↓
User Completes Payment
    ↓
Verify Payment Signature
    ↓
Update Order (payment_status: paid)
    ↓
Admin Sees Order
    ↓
Admin Accepts → Status: confirmed
```

---

## Testing Checklist

### Test Mode Testing
- [ ] Razorpay modal opens
- [ ] Test card payment succeeds
- [ ] Payment signature verified
- [ ] Order status updates to "paid"
- [ ] Payment record created in database
- [ ] Admin can see paid order
- [ ] User can track order

### Production Testing
- [ ] Small real payment succeeds
- [ ] Payment appears in Razorpay dashboard
- [ ] Settlement works correctly
- [ ] Refunds work (if needed)
- [ ] Webhooks configured (optional)

---

## Payment Methods Configuration

### Enable UPI Only
```typescript
methods: {
  razorpay: true,
  cash: false,
  pos: false
}
```

### Enable All Methods
```typescript
methods: {
  razorpay: true,
  cash: true,
  pos: true
}
```

### Cash Only (Current Demo Mode)
```typescript
methods: {
  razorpay: false,
  cash: true,
  pos: false
}
```

---

## Razorpay Dashboard Setup

### 1. Enable Payment Methods
- Go to Settings → Payment Methods
- Enable: UPI, Cards, Netbanking, Wallets
- Configure as needed

### 2. Set Up Webhooks (Optional)
- Go to Settings → Webhooks
- Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
- Select events: payment.captured, payment.failed

### 3. Configure Settlement
- Go to Settings → Settlements
- Set settlement schedule
- Add bank account details

---

## Security Checklist

When enabling payment:

- [ ] Never expose `RAZORPAY_KEY_SECRET` to client
- [ ] Always verify payment signature server-side
- [ ] Use HTTPS in production
- [ ] Store payment records in database
- [ ] Log all payment attempts
- [ ] Handle payment failures gracefully
- [ ] Implement refund workflow
- [ ] Set up payment monitoring

---

## Troubleshooting

### Razorpay Modal Not Opening
```typescript
// Check if script is loaded
console.log(typeof window.Razorpay) // Should be 'function'

// Verify key ID
console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
```

### Payment Verification Fails
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

### Payment Status Not Updating
- Check API route logs
- Verify database connection
- Check RLS policies
- Ensure user is authenticated

---

## Rollback to Demo Mode

If you need to disable payment again:

1. Set `payment.enabled = false` in `lib/config.ts`
2. Comment out Razorpay code in billing page
3. Restart server

---

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **API Reference**: https://razorpay.com/docs/api/

---

## Summary

**Current State**: Payment disabled, orders work without payment
**To Enable**: 
1. Get Razorpay KYC approved
2. Update environment variables
3. Set `payment.enabled = true` in config
4. Uncomment Razorpay code in billing page
5. Test thoroughly

**Time to Enable**: ~30 minutes (after KYC approval)

The payment infrastructure is already built and ready - just needs to be activated! 🚀
