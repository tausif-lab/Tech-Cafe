// app/components/usermenu/Providers.tsx
"use client";                          // ← REQUIRED — context needs client runtime
import { CartProvider } from "./Cartcontext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}