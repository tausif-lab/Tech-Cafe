import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging'

let adminApp: App

function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          // The private key comes from env as a single-line string with \n literals
          privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    } else {
      adminApp = getApps()[0]
    }
  }
  return adminApp
}

/**
 * Send a push notification to multiple FCM device tokens.
 *
 * @param tokens  Array of FCM registration tokens
 * @param title   Notification title
 * @param body    Notification body
 * @param data    Optional key-value data payload (must be string values)
 */
export async function sendPushToTokens(
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> {
  if (!tokens.length) return

  const messaging = getMessaging(getAdminApp())

  const message: MulticastMessage = {
    tokens,
    notification: { title, body },
    data,
    android: {
      priority: 'high',
      notification: {
        
        sound: 'default',
        priority: 'high',
        channelId: 'orders',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
          contentAvailable: true,
        },
      },
      headers: {
        'apns-priority': '10',
      },
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
       
        vibrate: [200, 100, 200],
         sound: 'default',
      },
      fcmOptions: {
        link: '/admin',
      },
    },
  }

  try {
    const response = await messaging.sendEachForMulticast(message)
    console.log(
      `[FCM Admin] Sent ${response.successCount}/${tokens.length} notifications`
    )
    if (response.failureCount > 0) {
      response.responses.forEach((resp, i) => {
        if (!resp.success) {
          console.warn(`[FCM Admin] Token[${i}] failed:`, resp.error?.message)
        }
      })
    }
  } catch (error) {
    console.error('[FCM Admin] sendEachForMulticast error:', error)
    throw error
  }
}
