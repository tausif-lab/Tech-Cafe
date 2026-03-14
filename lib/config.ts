// ============================================================
// APP CONFIGURATION
// ============================================================

export const APP_CONFIG = {
  // Payment Configuration
  payment: {
    // Set to true when Razorpay KYC is approved
    enabled: false,
    
    // Payment methods available
    methods: {
      razorpay: false,  // Online payment via Razorpay
      cash: true,       // Cash on pickup
      pos: false        // POS at counter
    }
  },
  
  // Feature Flags
  features: {
    slots: true,           // Pickup time slots
    coupons: true,         // Discount coupons
    favorites: true,       // User favorites
    notifications: true,   // Push notifications
    reviews: false         // Order reviews (future)
  },
  
  // Order Configuration
  orders: {
    autoConfirm: false,    // Auto-confirm orders (skip admin approval)
    minOrderValue: 0,      // Minimum order value
    maxOrderValue: 10000   // Maximum order value
  }
}

// Helper to check if payment is enabled
export const isPaymentEnabled = () => APP_CONFIG.payment.enabled

// Helper to get available payment methods
export const getAvailablePaymentMethods = () => {
  return Object.entries(APP_CONFIG.payment.methods)
    .filter(([_, enabled]) => enabled)
    .map(([method]) => method)
}
