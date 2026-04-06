'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getFirebaseMessaging, requestFCMToken, onMessage } from '@/lib/firebase/client'

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderAlert {
  orderId:     string
  cafeId:      string
  orderNumber: string
  title:       string
  body:        string
}

// ─── Looping Alert Sound (AudioContext — no external file needed) ─────────────
// Creates a pleasant two-tone "ding-dong" that repeats every 2 s until stopped.
function createAlertSound() {
  let stopped   = false
  let ctx: AudioContext | null = null
  let loopTimer: ReturnType<typeof setTimeout>

  function ding(time: number) {
    if (!ctx || stopped) return

    const play = (freq: number, start: number, duration: number) => {
      const osc  = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.connect(gain)
      gain.connect(ctx!.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0,    start)
      gain.gain.linearRampToValueAtTime(0.45, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
      osc.start(start)
      osc.stop(start + duration + 0.05)
    }

    play(1047, time,        0.45)   // C6  — first ding
    play(784,  time + 0.5,  0.55)   // G5  — dong

    loopTimer = setTimeout(() => ding(ctx!.currentTime), 2200)
  }

  function start() {
    try {
      ctx = new AudioContext()
      ding(ctx.currentTime)
    } catch (err) {
      console.warn('[FCMProvider] AudioContext unavailable:', err)
    }
  }

  function stop() {
    stopped = true
    clearTimeout(loopTimer)
    ctx?.close().catch(() => {})
    ctx = null
  }

  return { start, stop }
}

// ─── Permission Prompt Modal ───────────────────────────────────────────────────
function PermissionModal({
  onEnable,
  onDismiss,
}: {
  onEnable:  () => void
  onDismiss: () => void
}) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
        <div className="text-5xl mb-4">🔔</div>
        <h3 className="text-xl font-bold text-white mb-2">Enable Order Notifications</h3>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Get instant sound alerts when new orders arrive — even when this tab is in the
          background or the screen is locked.
        </p>
        <div className="flex gap-3">
          <button
            id="fcm-enable-btn"
            onClick={onEnable}
            className="flex-1 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 active:scale-95 transition-all"
          >
            Enable Notifications
          </button>
          <button
            id="fcm-later-btn"
            onClick={onDismiss}
            className="px-4 py-3 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── New Order Alert Modal ─────────────────────────────────────────────────────
function OrderAlertModal({
  alert,
  onAccept,
}: {
  alert:    OrderAlert
  onAccept: () => void
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm">
      {/* Pulsing outer glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-yellow-500/10 animate-ping" />
      </div>

      <div className="relative bg-zinc-900 border border-yellow-500/50 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-[0_0_80px_rgba(234,179,8,0.25)]">
        {/* Animated ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-yellow-500/40 animate-ping pointer-events-none" />

        <div className="relative text-center">
          <div className="text-6xl mb-4 animate-bounce select-none">🔔</div>

          <h2 className="text-2xl font-bold text-white mb-1">{alert.title}</h2>
          <p className="text-yellow-400 font-semibold text-lg mb-1">
            {alert.orderNumber}
          </p>
          <p className="text-gray-400 text-sm mb-8">{alert.body}</p>

          <p className="text-gray-500 text-xs mb-4 animate-pulse">
            🔊 Sound playing — accept to stop
          </p>

          <button
            id="fcm-accept-order-btn"
            onClick={onAccept}
            className="w-full py-3.5 rounded-xl bg-yellow-500 text-black font-bold text-base hover:bg-yellow-400 active:scale-95 transition-all"
          >
            ✓ Accept Order
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── FCMProvider (main) ───────────────────────────────────────────────────────
/**
 * Mount once in the admin layout.
 *
 * Flow:
 *  1. Register /firebase-messaging-sw.js service worker
 *  2. If permission is 'default' → show branded permission modal
 *  3. Once granted → get FCM token → save to Supabase (admin only)
 *  4. Foreground messages → show OrderAlertModal + loop "ding-dong" sound
 *  5. Background messages → handled by the service worker (OS notification)
 */
export default function FCMProvider() {
  const [orderAlert,         setOrderAlert]         = useState<OrderAlert | null>(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  const soundRef      = useRef<{ start: () => void; stop: () => void } | null>(null)
  const tokenSavedRef = useRef(false)
  const unsubRef      = useRef<(() => void) | null>(null)

  // ── Stop sound + dismiss modal ──────────────────────────────────────────────
  const handleAcceptOrder = useCallback(() => {
    soundRef.current?.stop()
    soundRef.current = null
    setOrderAlert(null)
  }, [])

  // ── Save token to Supabase then start listening ────────────────────────────
  const saveTokenAndListen = useCallback(async (token: string) => {
    if (tokenSavedRef.current) return

    try {
      const res = await fetch('/api/notifications/save-token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      })
      if (res.ok) {
        tokenSavedRef.current = true
        console.log('[FCMProvider] FCM token saved ✓')
      } else {
        const err = await res.json()
        console.error('[FCMProvider] Token save failed:', err)
      }
    } catch (err) {
      console.error('[FCMProvider] Token save error:', err)
    }

    // Start foreground message listener
    const messaging = getFirebaseMessaging()
    if (!messaging) return

    unsubRef.current = onMessage(messaging, (payload) => {
      console.log('[FCMProvider] Foreground FCM message:', payload)

      const data         = payload.data         ?? {}
      const notification = payload.notification  ?? {}

      const alert: OrderAlert = {
        orderId:     data.order_id     || '',
        cafeId:      data.cafe_id      || '',
        orderNumber: data.order_number || 'New Order',
        title:       notification.title || '🔔 New Order Received!',
        body:        notification.body  || 'A new order is waiting for your confirmation.',
      }

      // Play looping ding-dong sound
      const sound = createAlertSound()
      sound.start()
      soundRef.current = sound

      setOrderAlert(alert)
    })
  }, [])

  // ── Enable notifications (called from permission modal button) ─────────────
  const handleEnableNotifications = useCallback(async () => {
    setShowPermissionModal(false)

    const token = await requestFCMToken()
    if (!token) {
      console.error('[FCMProvider] Could not get FCM token after permission grant')
      return
    }

    await saveTokenAndListen(token)
  }, [saveTokenAndListen])

  // ── Init on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      if (typeof window === 'undefined') return
      if (!('serviceWorker' in navigator)) {
        console.warn('[FCMProvider] Service workers not supported')
        return
      }

      // 1. Register service worker
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
        await navigator.serviceWorker.ready
        console.log('[FCMProvider] Service worker registered ✓')
      } catch (err) {
        console.error('[FCMProvider] SW registration failed:', err)
        return
      }

      // 2. Check permission
      const permission = Notification.permission

      if (permission === 'denied') {
        console.warn('[FCMProvider] Notifications blocked by user — cannot register')
        return
      }

      if (permission === 'default') {
        // Show our branded prompt instead of the raw browser dialog
        setShowPermissionModal(true)
        return
      }

      // 3. Permission already granted — get token straight away
      const token = await requestFCMToken()
      if (!token) return

      await saveTokenAndListen(token)
    }

    init()

    return () => {
      unsubRef.current?.()
      soundRef.current?.stop()
    }
  }, [saveTokenAndListen])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {showPermissionModal && (
        <PermissionModal
          onEnable={handleEnableNotifications}
          onDismiss={() => setShowPermissionModal(false)}
        />
      )}
      {orderAlert && (
        <OrderAlertModal
          alert={orderAlert}
          onAccept={handleAcceptOrder}
        />
      )}
    </>
  )
}
