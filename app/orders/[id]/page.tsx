"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types'
import { Clock, CheckCircle, Package, Utensils, XCircle, type LucideIcon } from 'lucide-react'

const statusConfig: Record<OrderStatus, { label: string; icon: LucideIcon; color: string }> = {
  pending: { label: 'Order Placed', icon: Clock, color: 'text-yellow-500' },
  confirmed: { label: 'Confirmed by Cafe', icon: CheckCircle, color: 'text-green-500' },
  preparing: { label: 'Being Prepared', icon: Utensils, color: 'text-blue-500' },
  ready: { label: 'Ready for Pickup', icon: Package, color: 'text-purple-500' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-gray-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
  refunded: { label: 'Refunded', icon: XCircle, color: 'text-red-500' }
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const supabase = createClient()
    
    // Fetch initial order data
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const result = await response.json()
        
        if (result.error) {
          setError(result.error)
        } else {
          setOrder(result.data)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder(prev => prev ? { ...prev, ...payload.new } : null)
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F3A2E] flex items-center justify-center">
        <div className="text-white font-light text-lg">Loading order...</div>
      </div>
    )
  }
  
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#1F3A2E] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-6 font-light text-lg">{error || 'Order not found'}</p>
          <button
            onClick={() => router.push('/orders')}
            className="px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }
  
  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus.icon
  
  const statusSteps: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed']
  const currentStepIndex = statusSteps.indexOf(order.status)
  
  return (
    <div className="min-h-screen bg-[#1F3A2E] text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <button
              onClick={() => router.push('/orders')}
              className="text-gray-400 hover:text-white transition-colors font-light"
            >
              ← Back to Orders
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors font-light"
            >
              Home
            </button>
          </div>
          <h1 className="text-4xl font-light tracking-tight mb-3">Order #{order.order_number}</h1>
          <p className="text-gray-400 font-light">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        
        {/* Current Status */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
            </div>
            <div>
              <h2 className="text-2xl font-light tracking-tight">{currentStatus.label}</h2>
              {order.status === 'cancelled' && order.rejection_reason && (
                <p className="text-red-400 mt-2 font-light">Reason: {order.rejection_reason}</p>
              )}
              {order.status === 'ready' && order.estimated_ready_at && (
                <p className="text-green-400 mt-2 font-light">
                  Ready at {new Date(order.estimated_ready_at).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          {!['cancelled', 'refunded'].includes(order.status) && (
            <div className="mt-8">
              <div className="flex justify-between mb-3">
                {statusSteps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-light transition-all ${
                        index <= currentStepIndex
                          ? 'bg-green-500 text-white'
                          : 'bg-zinc-800 text-gray-500'
                      }`}
                    >
                      {index < currentStepIndex ? '✓' : index + 1}
                    </div>
                    <span className="text-xs mt-3 text-center font-light text-gray-400">
                      {statusConfig[step].label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative h-1.5 bg-zinc-800 rounded-full mt-6">
                <div
                  className="absolute h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Order Items */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8">
          <h3 className="text-xl font-light tracking-tight mb-6">Order Items</h3>
          <div className="space-y-6">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex gap-5 pb-6 border-b border-zinc-800 last:border-b-0 last:pb-0">
                {item.item_image_url && (
                  <img
                    src={item.item_image_url}
                    alt={item.item_name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-lg">{item.item_name}</p>
                      {item.variant_name && (
                        <p className="text-sm text-gray-400 mt-1 font-light">{item.variant_name}</p>
                      )}
                      {item.add_ons && item.add_ons.length > 0 && (
                        <p className="text-sm text-gray-400 mt-1 font-light">
                          Add-ons: {item.add_ons.map(a => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-lg">₹{item.total_price}</p>
                      <p className="text-sm text-gray-400 mt-1 font-light">Qty: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
          <h3 className="text-xl font-light tracking-tight mb-6">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between font-light">
              <span className="text-gray-400">Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-500 font-light">
                <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                <span>-₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between font-light">
              <span className="text-gray-400">Tax</span>
              <span>₹{order.tax_amount}</span>
            </div>
            <div className="border-t border-zinc-800 pt-4 mt-4">
              <div className="flex justify-between text-xl font-light">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm font-light pt-3">
              <span className="text-gray-400">Payment Status</span>
              <span className={order.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'}>
                {order.payment_status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm font-light">
              <span className="text-gray-400">Payment Method</span>
              <span>{order.payment_method.toUpperCase()}</span>
            </div>
          </div>
          
          {order.slot_date && order.slot_time && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-gray-400 text-sm mb-2 font-light">Pickup Time</p>
              <p className="font-light text-lg">
                {new Date(order.slot_date).toLocaleDateString()} at {order.slot_time}
              </p>
            </div>
          )}
          
          {order.notes && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-gray-400 text-sm mb-2 font-light">Notes</p>
              <p className="font-light">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}