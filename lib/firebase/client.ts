import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

// Singleton Firebase app — safe to call multiple times
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

/**
 * Get the Firebase Messaging instance.
 * Must be called in a browser context only.
 */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null
  try {
    return getMessaging(app)
  } catch (err) {
    console.error('[FCM] getMessaging error:', err)
    return null
  }
}

/**
 * Request notification permission and return an FCM device token.
 * Works on both localhost and production (Vercel).
 * Returns null if permission is denied or unsupported.
 */
export async function requestFCMToken(): Promise<string | null> {
  try {
    // Guard: browser only
    if (typeof window === 'undefined') {
      console.warn('[FCM] requestFCMToken called in SSR context — skipping')
      return null
    }

    if (!('Notification' in window)) {
      console.warn('[FCM] Notifications not supported in this browser')
      return null
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[FCM] Service Workers not supported in this browser')
      return null
    }

    // ── 1. Log env config presence (not values) for debugging ────────────────
    console.log('[FCM] Config check:', {
      hasApiKey:       !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasProjectId:    !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasVapidKey:     !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      hasMessagingId:  !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    })

    // ── 2. Request permission if needed ──────────────────────────────────────
    let permission = Notification.permission
    console.log('[FCM] Current permission:', permission)

    if (permission === 'default') {
      permission = await Notification.requestPermission()
      console.log('[FCM] Permission after request:', permission)
    }

    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission not granted:', permission)
      return null
    }

    // ── 3. Validate VAPID key ─────────────────────────────────────────────────
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.error('[FCM] VAPID key not set — add NEXT_PUBLIC_FIREBASE_VAPID_KEY to env')
      return null
    }

    // ── 4. Register service worker explicitly (works on both localhost + prod) ─
    // Using an explicit register() instead of navigator.serviceWorker.ready
    // ensures the SW is registered under the correct scope in production.
    let swRegistration: ServiceWorkerRegistration
    try {
      swRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      )
      console.log('[FCM] SW registration scope:', swRegistration.scope)
      // Wait until the SW is fully active
      await navigator.serviceWorker.ready
      console.log('[FCM] SW is active ✓')
    } catch (swErr) {
      console.error('[FCM] Service worker registration failed:', swErr)
      return null
    }

    // ── 5. Get messaging instance ─────────────────────────────────────────────
    const messaging = getFirebaseMessaging()
    if (!messaging) {
      console.error('[FCM] Messaging instance not available')
      return null
    }

    // ── 6. Get FCM token ──────────────────────────────────────────────────────
    console.log('[FCM] Requesting token from Firebase...')
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    })

    if (!token) {
      console.error('[FCM] getToken returned empty — check VAPID key and SW config')
      return null
    }

    console.log('[FCM] ✅ Token obtained:', token.substring(0, 20) + '...')

    // Expose token on window for quick debugging (temporary — no permanent side effects)
    if (typeof window !== 'undefined') {
      (window as any).fcmToken = token
      console.log('[FCM] Token exposed as window.fcmToken for debugging')
    }

    return token
  } catch (error) {
    console.error('[FCM] requestFCMToken error:', error)
    return null
  }
}

export { onMessage, app }
