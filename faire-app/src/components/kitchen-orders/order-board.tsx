"use client"

import { useOrders } from "./orders-provider"
import { OrderCard } from "./order-card"
import { useState } from "react"

export function OrderBoard() {
  const { orders } = useOrders()
  const [viewMode, setViewMode] = useState<"all" | "ordering" | "decided" | "cooking" | "finished">("all")

  const filteredOrders = viewMode === "all" ? orders : orders.filter((order) => order.status === viewMode)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setViewMode("all")}
          className={`px-4 py-2 rounded-lg ${viewMode === "all" ? "bg-slate-800 text-white" : "bg-slate-200"}`}
        >
          All Orders
        </button>
        <button
          onClick={() => setViewMode("ordering")}
          className={`px-4 py-2 rounded-lg ${viewMode === "ordering" ? "bg-amber-500 text-white" : "bg-slate-200"}`}
        >
          Ordering
        </button>
        <button
          onClick={() => setViewMode("decided")}
          className={`px-4 py-2 rounded-lg ${viewMode === "decided" ? "bg-blue-500 text-white" : "bg-slate-200"}`}
        >
          Decided
        </button>
        <button
          onClick={() => setViewMode("cooking")}
          className={`px-4 py-2 rounded-lg ${viewMode === "cooking" ? "bg-orange-500 text-white" : "bg-slate-200"}`}
        >
          Cooking
        </button>
        <button
          onClick={() => setViewMode("finished")}
          className={`px-4 py-2 rounded-lg ${viewMode === "finished" ? "bg-green-500 text-white" : "bg-slate-200"}`}
        >
          Finished
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No orders in this category</p>
        </div>
      )}
    </div>
  )
}
