// firebase-messaging-sw.js
// This file MUST be served from the root of your domain: /firebase-messaging-sw.js
// Next.js serves everything in /public at the root, so place this file at:
//   public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// ─── IMPORTANT ───────────────────────────────────────────────────────────────
// Replace these values with your actual Firebase config.
// Service workers cannot access Next.js env vars, so values must be hardcoded here.
// These are public/safe client keys – NOT your Admin SDK private key.
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyDSFgoP3WepTqGImh5d4tpUhyl29UNJQXI',
  authDomain:        'tech-cafe-40e07.firebaseapp.com',
  projectId:         'tech-cafe-40e07',
  storageBucket:     'tech-cafe-40e07.firebasestorage.app',
  messagingSenderId: '819385560560',
  appId:             '1:819385560560:web:f9b89e12e370fc189b8135',
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// ─── Background Message Handler ───────────────────────────────────────────────
// This fires when:
//   • The browser tab is hidden / minimised
//   • The browser is open but the tab is not active
//   • The device screen is locked (mobile PWA)
// ──────────────────────────────────────────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)

  const { title, body } = payload.notification ?? {}
  const data            = payload.data ?? {}

  const notificationTitle = title || 'New Order Received! 🔔'
  const notificationBody  = body  || 'A new order is waiting for your action.'

  const notificationOptions = {
    body:    notificationBody,
    icon:    '/favicon.ico',
    badge:   '/favicon.ico',
    tag:     `order-${data.order_id || Date.now()}`, // deduplicate same order
    renotify: true,                                   // ring again even with same tag
    requireInteraction: true,                         // stay on screen until dismissed
    silent:  false,                                   // IMPORTANT: allow sound
    vibrate: [300, 100, 300, 100, 300],               // long-short-long pattern
    data: {
      url:      '/admin',
      order_id: data.order_id,
      cafe_id:  data.cafe_id,
    },
    actions: [
      { action: 'open',    title: '📋 Open Dashboard' },
      { action: 'dismiss', title: '✕ Dismiss'         },
    ],
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// ─── Notification Click Handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/admin'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If admin tab is already open, focus it
        for (const client of windowClients) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})
