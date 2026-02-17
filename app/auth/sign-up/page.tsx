'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

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
    .anim-fade-up   { animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-fade-in   { animation: fadeIn 0.5s ease both; }
    .delay-1 { animation-delay: 0.08s; }
    .delay-2 { animation-delay: 0.16s; }
    .delay-3 { animation-delay: 0.24s; }
    .delay-4 { animation-delay: 0.32s; }
    .delay-5 { animation-delay: 0.40s; }
    .delay-6 { animation-delay: 0.48s; }

    .cc-input {
      width: 100%;
      background: rgba(232,225,207,0.04);
      border: 1px solid rgba(232,225,207,0.14);
      color: #E8E1CF;
      padding: 14px 16px;
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
  `}</style>
)

export default function SignupPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      toast.error(error.message)
    } else if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: name,
        role: 'customer',
      })
      toast.success('Account created!')
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

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
              position: 'absolute',
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(217,75,75,0.3), transparent)',
              animation: 'scanline 8s linear infinite',
            }}
          />
        </div>

        {/* Top nav strip */}
        <div
          className="w-full flex items-center justify-between px-6 md:px-12 py-4 anim-fade-in"
          style={{ borderBottom: '1px solid rgba(232,225,207,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D94B4B' }} />
            <span
              className="text-[9px] tracking-[0.55em] uppercase"
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
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4 py-16">

          {/* Eyebrow */}
          <p
            className="text-[9px] tracking-[0.6em] uppercase mb-6 anim-fade-up"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(217,75,75,0.7)' }}
          >
            New Account
          </p>

          {/* Big headline */}
          <h1
            className="font-extrabold uppercase leading-none text-center mb-10 anim-fade-up delay-1"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
              letterSpacing: '-0.03em',
              lineHeight: 0.92,
              color: '#E8E1CF',
            }}
          >
            Create<br />
            <span style={{ color: '#D94B4B' }}>Account</span>
          </h1>

          {/* Form card */}
          <div
            className="w-full max-w-sm anim-fade-up delay-2"
            style={{
              border: '1px solid rgba(232,225,207,0.12)',
              backgroundColor: 'rgba(232,225,207,0.03)',
            }}
          >
            {/* Card header strip */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(232,225,207,0.1)' }}
            >
              <span
                className="text-[9px] tracking-[0.5em] uppercase"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.3)' }}
              >
                Auth · Register
              </span>
              <span
                className="text-[9px] tracking-[0.4em] uppercase px-2 py-1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: '#D94B4B',
                  border: '1px solid rgba(217,75,75,0.35)',
                }}
              >
                Free
              </span>
            </div>

            <div className="p-6 space-y-4">
              {/* Full name */}
              <div className="anim-fade-up delay-3">
                <label
                  className="block text-[9px] tracking-[0.45em] uppercase mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  className="cc-input"
                  placeholder="Ravi Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Email */}
              <div className="anim-fade-up delay-4">
                <label
                  className="block text-[9px] tracking-[0.45em] uppercase mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  className="cc-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="anim-fade-up delay-5">
                <label
                  className="block text-[9px] tracking-[0.45em] uppercase mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.35)' }}
                >
                  Password
                  <span style={{ color: 'rgba(232,225,207,0.2)', marginLeft: '8px' }}>Min. 6 chars</span>
                </label>
                <input
                  type="password"
                  className="cc-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Strength indicator */}
              <div className="flex gap-1 anim-fade-up delay-5">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-0.5 flex-1 transition-all duration-300"
                    style={{
                      backgroundColor:
                        password.length === 0
                          ? 'rgba(232,225,207,0.1)'
                          : password.length < 6 && i <= 2
                          ? '#D94B4B'
                          : password.length >= 6 && i <= 3
                          ? '#4CAF50'
                          : password.length >= 10 && i === 4
                          ? '#4CAF50'
                          : 'rgba(232,225,207,0.1)',
                    }}
                  />
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98] anim-fade-up delay-6"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: '#D94B4B',
                  color: '#E8E1CF',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Creating account…' : (
                  <>
                    Create Account
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex items-center justify-center"
              style={{ borderTop: '1px solid rgba(232,225,207,0.08)' }}
            >
              <p
                className="text-[10px] tracking-wide"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.3)' }}
              >
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="transition-colors duration-200"
                  style={{ color: '#D94B4B' }}
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom label */}
          <p
            className="mt-8 text-[9px] tracking-[0.4em] uppercase anim-fade-up delay-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(232,225,207,0.15)' }}
          >
            CleverCodex · GEC Campus · Secured
          </p>
        </div>
      </div>
    </>
  )
}