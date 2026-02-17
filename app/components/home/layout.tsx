// layout.tsx or _app.tsx
import { CartProvider } from "../usermenu/Cartcontext";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
