'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

// ── Types ────────────────────────────────────────────────────────────────────
type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

type Order = {
  id: string
  created_at: string
  total: number
  status: string
  items_count: number
}

// ── Font & style loader ───────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scanline {
      0%   { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    .anim-fade-up  { animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-fade-in  { animation: fadeIn 0.5s ease both; }
    .delay-1 { animation-delay: 0.08s; }
    .delay-2 { animation-delay: 0.16s; }
    .delay-3 { animation-delay: 0.24s; }
    .delay-4 { animation-delay: 0.32s; }
    .delay-5 { animation-delay: 0.40s; }

    .cc-input {
      width: 100%;
      background: rgba(232,225,207,0.04);
      border: 1px solid rgba(232,225,207,0.14);
      color: #E8E1CF;
      padding: 12px 16px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .cc-input::placeholder { color: rgba(232,225,207,0.25); }
    .cc-input:focus {
      border-color: rgba(217,75,75,0.55);
      background: rgba(232,225,207,0.07);
    }

    .grid-bg {
      background-image:
        linear-gradient(rgba(232,225,207,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(232,225,207,0.04) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    .acct-panel {
      border: 1px solid rgba(232,225,207,0.12);
      background: rgba(232,225,207,0.03);
    }
    .acct-panel-header {
      padding: 14px 20px;
      border-bottom: 1px solid rgba(232,225,207,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      font-size: 9px;
      letter-spacing: 0.4em;
      text-transform: uppercase;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Tab active */
    .tab-active {
      color: #E8E1CF !important;
      border-bottom: 2px solid #D94B4B !important;
    }
    .menu-scroll::-webkit-scrollbar { display: none; }
  `}</style>
)

// ── Status helpers ────────────────────────────────────────────────────────────
function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered': return { color: '#4CAF50', border: 'rgba(76,175,80,0.35)' }
    case 'pending':   return { color: '#FFC107', border: 'rgba(255,193,7,0.35)'  }
    case 'cancelled': return { color: '#D94B4B', border: 'rgba(217,75,75,0.35)'  }
    default:          return { color: 'rgba(232,225,207,0.4)', border: 'rgba(232,225,207,0.2)' }
  }
}

// ── Avatar initials ───────────────────────────────────────────────────────────
function Initials({ name }: { name: string }) {
  const parts = (name || 'U').split(' ')
  const ini   = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2)
  return <>{ini.toUpperCase()}</>
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile]     = useState<Profile | null>(null)
  const [orders, setOrders]       = useState<Order[]>([])
  const [tab, setTab]             = useState<'overview' | 'orders' | 'settings'>('overview')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [editName, setEditName]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // ── Load profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (prof) {
        setProfile(prof)
        setEditName(prof.full_name || '')
      }

      // Try to load orders (graceful if table doesn't exist yet)
      try {
        const { data: ords } = await supabase
          .from('orders')
          .select('id, created_at, total, status, items_count')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
        setOrders(ords || [])
      } catch {
        setOrders([])
      }

      setLoadingProfile(false)
    }
    load()
  }, [router, supabase])

  // ── Save name ──────────────────────────────────────────────────────────────
  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName })
      .eq('id', profile.id)
    if (error) toast.error(error.message)
    else {
      setProfile(p => p ? { ...p, full_name: editName } : p)
      toast.success('Name updated!')
    }
    setSaving(false)
  }

  // ── Sign out ───────────────────────────────────────────────────────────────
  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    toast.success('Signed out.')
    router.push('/')
    router.refresh()
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <>
        <FontLoader />
        <div
          className="min-h-screen grid-bg flex items-center justify-center"
          style={{ backgroundColor: '#1F3A2E' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: 'rgba(217,75,75,0.3)', borderTopColor: '#D94B4B' }}
            />
            <span
              className="text-[9px] tracking-[0.5em] uppercase"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.3)' }}
            >
              Loading
            </span>
          </div>
        </div>
      </>
    )
  }

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'overview',  label: 'Overview'  },
    { key: 'orders',    label: 'Orders'    },
    { key: 'settings',  label: 'Settings'  },
  ]

  return (
    <>
      <FontLoader />
      <div
        className="min-h-screen grid-bg relative overflow-hidden"
        style={{ backgroundColor: '#1F3A2E' }}
      >
        {/* Scanline accent */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            style={{
              position: 'absolute', left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(217,75,75,0.25), transparent)',
              animation: 'scanline 10s linear infinite',
            }}
          />
        </div>

        {/* ── Top nav strip ── */}
        <div
          className="w-full flex items-center justify-between px-6 md:px-12 py-4 anim-fade-in"
          style={{ borderBottom: '1px solid rgba(232,225,207,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D94B4B' }} />
            <span
              className="text-[9px] tracking-[0.55em] uppercase hidden md:block"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.3)' }}
            >
              GEC Campus
            </span>
          </div>
          <Link href="/">
            <span
              className="font-extrabold uppercase tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#E8E1CF' }}
            >
              Clever<span style={{ color: '#D94B4B' }}>Codex.</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[9px] tracking-[0.45em] uppercase transition-colors duration-200"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
            >
              ← Menu
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-[9px] tracking-[0.45em] uppercase transition-colors duration-200 hover:opacity-80"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#D94B4B',
                opacity: signingOut ? 0.5 : 1,
              }}
            >
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* ── Page header ── */}
        <div
          className="px-6 md:px-12 pt-12 pb-8 anim-fade-up"
          style={{ borderBottom: '2px solid rgba(232,225,207,0.1)' }}
        >
          <div className="max-w-screen-lg mx-auto flex items-end justify-between gap-6 flex-wrap">
            {/* Left: breadcrumb */}
            <p
              className="text-[9px] tracking-[0.5em] uppercase self-start"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.3)' }}
            >
              CleverCodex &bull; <span style={{ color: '#D94B4B' }}>Account</span>
            </p>

            {/* Centre: big title */}
            <h1
              className="font-extrabold uppercase leading-none flex-1 anim-fade-up delay-1"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                letterSpacing: '-0.03em',
                lineHeight: 0.92,
                color: '#E8E1CF',
              }}
            >
              My<br /><span style={{ color: '#D94B4B' }}>Account</span>
            </h1>

            {/* Right: avatar + meta */}
            <div className="self-end flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 flex items-center justify-center font-extrabold text-lg"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  backgroundColor: '#D94B4B',
                  color: '#E8E1CF',
                  letterSpacing: '-0.02em',
                }}
              >
                <Initials name={profile?.full_name || 'User'} />
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ fontFamily: "'Syne', sans-serif", color: '#E8E1CF' }}
                >
                  {profile?.full_name || 'User'}
                </p>
                <span
                  className="text-[9px] tracking-[0.4em] uppercase px-2 py-0.5 mt-1 inline-block"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#D94B4B',
                    border: '1px solid rgba(217,75,75,0.35)',
                  }}
                >
                  {profile?.role || 'customer'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab row ── */}
        <div
          className="px-6 md:px-12 menu-scroll overflow-x-auto anim-fade-up delay-2"
          style={{ borderBottom: '2px solid rgba(232,225,207,0.1)' }}
        >
          <div className="max-w-screen-lg mx-auto flex gap-0">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-4 text-[9px] tracking-[0.5em] uppercase font-semibold transition-all duration-200 border-b-2 border-transparent ${tab === t.key ? 'tab-active' : ''}`}
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: tab === t.key ? '#E8E1CF' : 'rgba(232,225,207,0.3)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-6 md:px-12 py-10 max-w-screen-lg mx-auto space-y-6">

          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 anim-fade-up delay-3">
                {[
                  { label: 'Total Orders', value: orders.length.toString() },
                  { label: 'Delivered',    value: orders.filter(o => o.status === 'delivered').length.toString() },
                  { label: 'Pending',      value: orders.filter(o => o.status === 'pending').length.toString() },
                  {
                    label: 'Total Spent',
                    value: '₹' + orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(0),
                  },
                ].map(stat => (
                  <div key={stat.label} className="acct-panel">
                    <div className="acct-panel-header">
                      <span
                        className="text-[9px] tracking-[0.45em] uppercase"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.3)' }}
                      >
                        {stat.label}
                      </span>
                    </div>
                    <div className="px-5 py-4">
                      <p
                        className="font-extrabold"
                        style={{
                          fontFamily: "'Syne', sans-serif",
                          fontSize: '2rem',
                          letterSpacing: '-0.03em',
                          color: '#E8E1CF',
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="acct-panel anim-fade-up delay-4">
                <div className="acct-panel-header">
                  <span
                    className="text-[9px] tracking-[0.5em] uppercase"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
                  >
                    Recent Orders
                  </span>
                  <button
                    onClick={() => setTab('orders')}
                    className="text-[9px] tracking-[0.4em] uppercase transition-colors duration-200"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#D94B4B' }}
                  >
                    View all →
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p
                      className="text-[10px] tracking-[0.4em] uppercase"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.2)' }}
                    >
                      No orders yet
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 text-[9px] font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        backgroundColor: '#D94B4B',
                        color: '#E8E1CF',
                      }}
                    >
                      Browse Menu →
                    </Link>
                  </div>
                ) : (
                  <div>
                    {orders.slice(0, 3).map((order, i) => (
                      <OrderRow key={order.id} order={order} isLast={i === Math.min(orders.length, 3) - 1} />
                    ))}
                  </div>
                )}
              </div>

              {/* Profile quick-view */}
              <div className="acct-panel anim-fade-up delay-5">
                <div className="acct-panel-header">
                  <span
                    className="text-[9px] tracking-[0.5em] uppercase"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
                  >
                    Profile
                  </span>
                  <button
                    onClick={() => setTab('settings')}
                    className="text-[9px] tracking-[0.4em] uppercase"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#D94B4B' }}
                  >
                    Edit →
                  </button>
                </div>
                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Display Name', value: profile?.full_name || '—' },
                    { label: 'Role',         value: profile?.role || 'customer' },
                  ].map(row => (
                    <div key={row.label}>
                      <p
                        className="text-[9px] tracking-[0.4em] uppercase mb-1"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.3)' }}
                      >
                        {row.label}
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#E8E1CF' }}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="acct-panel anim-fade-up delay-3">
              <div className="acct-panel-header">
                <span
                  className="text-[9px] tracking-[0.5em] uppercase"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
                >
                  Order History
                </span>
                <span
                  className="text-[9px] tracking-[0.4em] uppercase px-2 py-0.5"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#D94B4B',
                    border: '1px solid rgba(217,75,75,0.3)',
                  }}
                >
                  {orders.length} orders
                </span>
              </div>
              {orders.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p
                    className="text-[10px] tracking-[0.4em] uppercase mb-2"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.2)' }}
                  >
                    No orders placed yet
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 text-[9px] font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      backgroundColor: '#D94B4B',
                      color: '#E8E1CF',
                    }}
                  >
                    Browse Menu →
                  </Link>
                </div>
              ) : (
                <div>
                  {orders.map((order, i) => (
                    <OrderRow key={order.id} order={order} isLast={i === orders.length - 1} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <div className="space-y-6 anim-fade-up delay-3">
              {/* Edit profile */}
              <div className="acct-panel">
                <div className="acct-panel-header">
                  <span
                    className="text-[9px] tracking-[0.5em] uppercase"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
                  >
                    Edit Profile
                  </span>
                </div>
                <form onSubmit={handleSaveName} className="p-6 space-y-4">
                  <div>
                    <label
                      className="block text-[9px] tracking-[0.45em] uppercase mb-2"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="cc-input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 text-[9px] font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      backgroundColor: '#D94B4B',
                      color: '#E8E1CF',
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                    {!saving && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>

              {/* Danger zone */}
              <div className="acct-panel" style={{ borderColor: 'rgba(217,75,75,0.2)' }}>
                <div
                  className="acct-panel-header"
                  style={{ borderBottomColor: 'rgba(217,75,75,0.15)' }}
                >
                  <span
                    className="text-[9px] tracking-[0.5em] uppercase"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(217,75,75,0.6)' }}
                  >
                    Session
                  </span>
                </div>
                <div className="p-6 flex items-center justify-between flex-wrap gap-4">
                  <p
                    className="text-xs"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.4)' }}
                  >
                    Signed in as <span style={{ color: '#E8E1CF' }}>{profile?.full_name}</span>
                  </p>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center gap-2 px-5 py-2.5 text-[9px] font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-80"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#D94B4B',
                      border: '1px solid rgba(217,75,75,0.4)',
                      opacity: signingOut ? 0.5 : 1,
                    }}
                  >
                    {signingOut ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom strip ── */}
        <div
          className="px-6 md:px-12 py-5 flex items-center justify-between flex-wrap gap-4 mt-10"
          style={{ borderTop: '2px solid rgba(232,225,207,0.1)' }}
        >
          <div className="flex items-center gap-6">
            {['🍕 Stone-baked Daily', '☕ Fresh Brewed', '⚡ Campus Fast'].map(tag => (
              <span
                key={tag}
                className="text-[9px] tracking-[0.35em] uppercase hidden md:block"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.2)' }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2 text-[9px] font-semibold tracking-widest uppercase px-5 py-2.5 transition-all duration-200"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'rgba(232,225,207,0.4)',
                border: '1px solid rgba(232,225,207,0.15)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Order row sub-component ───────────────────────────────────────────────────
function OrderRow({ order, isLast }: { order: Order; isLast: boolean }) {
  const { color, border } = statusColor(order.status)
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div
      className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap transition-colors duration-200 hover:bg-[rgba(232,225,207,0.03)]"
      style={{ borderBottom: isLast ? 'none' : '1px solid rgba(232,225,207,0.08)' }}
    >
      <div className="flex items-center gap-4">
        {/* Order ID */}
        <div>
          <p
            className="text-[9px] tracking-[0.4em] uppercase mb-0.5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.25)' }}
          >
            Order
          </p>
          <p
            className="font-bold text-xs"
            style={{ fontFamily: "'Syne', sans-serif", color: '#E8E1CF' }}
          >
            #{order.id.slice(-6).toUpperCase()}
          </p>
        </div>

        {/* Date */}
        <div className="hidden md:block">
          <p
            className="text-[9px] tracking-[0.4em] uppercase mb-0.5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.25)' }}
          >
            Date
          </p>
          <p
            className="text-xs"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.6)' }}
          >
            {date}
          </p>
        </div>

        {/* Items */}
        {order.items_count != null && (
          <div className="hidden md:block">
            <p
              className="text-[9px] tracking-[0.4em] uppercase mb-0.5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.25)' }}
            >
              Items
            </p>
            <p
              className="text-xs"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.6)' }}
            >
              {order.items_count}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Total */}
        <p
          className="font-bold"
          style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', color: '#E8E1CF' }}
        >
          ₹{(order.total || 0).toFixed(0)}
        </p>

        {/* Status pill */}
        <span
          className="status-pill"
          style={{ color, border: `1px solid ${border}` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: color }}
          />
          {order.status || 'processing'}
        </span>
      </div>
    </div>
  )
}