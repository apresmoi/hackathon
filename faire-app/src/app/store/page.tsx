"use client"
import { OrderBoard } from "@/components/kitchen-orders/order-board"
import { OrdersProvider } from "@/components/kitchen-orders/orders-provider"

export default function OrdersPage() {
  return (
    <OrdersProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Kitchen Orders</h1>
        <OrderBoard />
      </div>
    </OrdersProvider>
  )
}
