"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order } from '@/types'
import { Clock, CheckCircle, Package, Utensils, XCircle } from 'lucide-react'

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
  preparing: { label: 'Preparing', icon: Utensils, color: 'text-blue-500 bg-blue-500/10' },
  ready: { label: 'Ready', icon: Package, color: 'text-purple-500 bg-purple-500/10' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-gray-500 bg-gray-500/10' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500 bg-red-500/10' },
  refunded: { label: 'Refunded', icon: XCircle, color: 'text-red-500 bg-red-500/10' }
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        const result = await response.json()
        
        if (result.error) {
          setError(result.error)
        } else {
          setOrders(result.data || [])
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading orders...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white text-black rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-gray-400">Track your orders and view order history</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800 transition"
            >
              Home
            </button>
            <button
              onClick={() => router.push('/Accountpage')}
              className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Profile
            </button>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-zinc-900 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-4">No orders yet</p>
            <button
              onClick={() => router.push('/categorysection')}
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status]
              const StatusIcon = status.icon
              
              return (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">Order #{order.order_number}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.color} mb-2`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">{status.label}</span>
                      </div>
                      <p className="text-xl font-bold">₹{order.total_amount}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-zinc-700 pt-4">
                    <p className="text-sm text-gray-400 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.order_items?.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="text-sm bg-zinc-800 px-3 py-1 rounded-full"
                        >
                          {item.quantity}× {item.item_name}
                        </span>
                      ))}
                      {order.order_items && order.order_items.length > 3 && (
                        <span className="text-sm text-gray-400">
                          +{order.order_items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {order.slot_date && order.slot_time && (
                    <div className="mt-4 pt-4 border-t border-zinc-700">
                      <p className="text-sm text-gray-400">
                        Pickup: {new Date(order.slot_date).toLocaleDateString()} at {order.slot_time}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-right">
                    <span className="text-sm text-blue-400 hover:text-blue-300">
                      View Details →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
