'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  Image, Tag, Clock, BarChart2, LogOut, Coffee
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin',          label: 'Dashboard',  icon: LayoutDashboard  },
  { href: '/admin/orders',   label: 'Orders',     icon: ShoppingBag      },
  { href: '/admin/menu',     label: 'Menu',       icon: UtensilsCrossed  },
  { href: '/admin/banners',  label: 'Banners',    icon: Image            },
  { href: '/admin/coupons',  label: 'Coupons',    icon: Tag              },
  { href: '/admin/slots',    label: 'Slots',      icon: Clock            },
  { href: '/admin/reports',  label: 'Reports',    icon: BarChart2        },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-zinc-800 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500 flex items-center justify-center">
            <Coffee size={18} className="text-black" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-yellow-500">Tech Cafe</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-zinc-900'
              )}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
