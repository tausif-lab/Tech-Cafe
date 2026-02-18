"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

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
);

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("invalid login credentials") ||
        error.message.toLowerCase().includes("invalid password")
      ) {
        setAuthError(
          "This email is registered but the password is incorrect. Please try again or reset your password.",
        );
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setAuthError(
          "Your email is not verified yet. Please check your inbox for a confirmation link.",
        );
      } else if (
        error.message.toLowerCase().includes("user not found") ||
        error.message.toLowerCase().includes("no user found")
      ) {
        setAuthError("No account found with this email. Please sign up first.");
      } else {
        setAuthError(error.message);
      }
      toast.error("Login failed");
    } else if (data.user) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || email,
          role: "customer",
        });
      }
      toast.success("Welcome back!");
      router.push(`/Accountpage`);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${redirectTo}`,
      },
    });
    if (error) toast.error(error.message);
    setGoogleLoading(false);
  }

  return (
    <>
      <FontLoader />
      <div
        className="min-h-screen grid-bg relative overflow-hidden"
        style={{ backgroundColor: "#1F3A2E" }}
      >
        {/* Scanline accent */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(217,75,75,0.3), transparent)",
              animation: "scanline 8s linear infinite",
            }}
          />
        </div>

        {/* Top border strip */}
        <div
          className="w-full flex items-center justify-between px-6 md:px-12 py-4 anim-fade-in"
          style={{ borderBottom: "1px solid rgba(232,225,207,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#D94B4B" }}
            />
            <span
              className="text-[9px] tracking-[0.55em] uppercase"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(232,225,207,0.3)",
              }}
            >
              GEC Campus
            </span>
          </div>
          <Link href="/">
            <span
              className="font-extrabold uppercase tracking-tight"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "1.1rem",
                letterSpacing: "-0.02em",
                color: "#E8E1CF",
              }}
            >
              Clever<span style={{ color: "#D94B4B" }}>Codex.</span>
            </span>
          </Link>
        </div>

        {/* Main centred content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] px-4 py-16">
          {/* Eyebrow */}
          <p
            className="text-[9px] tracking-[0.6em] uppercase mb-6 anim-fade-up"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(217,75,75,0.7)",
            }}
          >
            Member Access
          </p>

          {/* Big headline */}
          <h1
            className="font-extrabold uppercase leading-none text-center mb-10 anim-fade-up delay-1"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(3rem, 8vw, 6rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
              color: "#E8E1CF",
            }}
          >
            Sign
            <br />
            <span style={{ color: "#D94B4B" }}>In</span>
          </h1>

          {/* Form card */}
          <div
            className="w-full max-w-sm anim-fade-up delay-2"
            style={{
              border: "1px solid rgba(232,225,207,0.12)",
              backgroundColor: "rgba(232,225,207,0.03)",
            }}
          >
            {/* Card header strip */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(232,225,207,0.1)" }}
            >
              <span
                className="text-[9px] tracking-[0.5em] uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.3)",
                }}
              >
                Auth · Login
              </span>
              <span
                className="text-[9px] tracking-[0.4em] uppercase px-2 py-1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#D94B4B",
                  border: "1px solid rgba(217,75,75,0.35)",
                }}
              >
                Secure
              </span>
            </div>

            <div className="p-6 space-y-4">
              {/* Auth Error Banner */}
              {authError && (
                <div
                  className="anim-fade-up p-3 text-[11px] leading-relaxed"
                  style={{
                    backgroundColor: "rgba(217,75,75,0.1)",
                    border: "1px solid rgba(217,75,75,0.35)",
                    color: "rgba(232,225,207,0.75)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <span style={{ color: "#D94B4B", fontWeight: 600 }}>
                    ⚠ Login failed —{" "}
                  </span>
                  {authError}
                </div>
              )}
              {/* Email */}
              <div className="anim-fade-up delay-3">
                <label
                  className="block text-[9px] tracking-[0.45em] uppercase mb-2"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "rgba(232,225,207,0.35)",
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  className="cc-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="anim-fade-up delay-4">
                <label
                  className="block text-[9px] tracking-[0.45em] uppercase mb-2"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: "rgba(232,225,207,0.35)",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  className="cc-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200 hover:opacity-90 active:scale-[0.98] anim-fade-up delay-5"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: "#D94B4B",
                  color: "#E8E1CF",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  "Signing in…"
                ) : (
                  <>
                    Sign In
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div
              className="mx-6 flex items-center gap-4"
              style={{ borderTop: "1px solid rgba(232,225,207,0.08)" }}
            >
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "rgba(232,225,207,0.08)" }}
              />
              <span
                className="py-4 text-[9px] tracking-[0.4em] uppercase"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.2)",
                }}
              >
                or
              </span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "rgba(232,225,207,0.08)" }}
              />
            </div>

            {/* Google */}
            <div className="px-6 pb-6">
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 text-[10px] font-semibold tracking-widest uppercase transition-all duration-200 hover:border-opacity-40 active:scale-[0.98]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.6)",
                  border: "1px solid rgba(232,225,207,0.15)",
                  opacity: googleLoading ? 0.7 : 1,
                }}
              >
                <GoogleIcon />
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </button>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 flex items-center justify-center"
              style={{ borderTop: "1px solid rgba(232,225,207,0.08)" }}
            >
              <p
                className="text-[10px] tracking-wide"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.3)",
                }}
              >
                No account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="transition-colors duration-200"
                  style={{ color: "#D94B4B" }}
                >
                  Sign up →
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom label */}
          <p
            className="mt-8 text-[9px] tracking-[0.4em] uppercase anim-fade-up delay-5"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "rgba(232,225,207,0.15)",
            }}
          >
            CleverCodex · GEC Campus · Secured
          </p>
        </div>
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

