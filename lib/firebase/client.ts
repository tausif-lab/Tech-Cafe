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

// Singleton Firebase app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

/**
 * Get the Firebase Messaging instance.
 * Must be called in a browser context only.
 */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null
  try {
    return getMessaging(app)
  } catch {
    return null
  }
}

/**
 * Request notification permission and return an FCM device token.
 * Returns null if permission is denied or unsupported.
 */
export async function requestFCMToken(): Promise<string | null> {
  try {
    if (!('Notification' in window)) {
      console.warn('[FCM] Notifications not supported in this browser')
      return null
    }

    // Request permission if not yet decided
    let permission = Notification.permission
    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    if (permission !== 'granted') {
      console.warn('[FCM] Notification permission not granted:', permission)
      return null
    }

    const messaging = getFirebaseMessaging()
    if (!messaging) {
      console.warn('[FCM] Messaging instance not available')
      return null
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.error('[FCM] VAPID key is not configured in environment')
      return null
    }

    // Ensure the service worker is active before requesting a token
    const registration = await navigator.serviceWorker.ready

    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })

    if (!token) {
      console.error('[FCM] getToken returned empty — check VAPID key and SW registration')
      return null
    }

    console.log('[FCM] Token obtained:', token.substring(0, 20) + '...')
    return token
  } catch (error) {
    console.error('[FCM] requestFCMToken error:', error)
    return null
  }
}

export { onMessage, app }
