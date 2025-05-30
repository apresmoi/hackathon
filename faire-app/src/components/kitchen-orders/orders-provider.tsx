"use client"

import { ordersAtom } from "@/hooks/atoms"
import { useAtom } from "jotai"
import type React from "react"

import { createContext, useContext } from "react"

// Data model as specified

export interface Order {
  id: string
  desc: string
  userName: string
  status: "ordering" | "decided" | "cooking" | "finished"
}
// Hook contract as specified
interface OrdersContextType {
  orders: any[]
  setAsCooking: (orderId: string) => void
  setAsFinished: (orderId: string) => void
  removeOrder: (orderId: string) => void
}

// Create context
const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

// Sample data
const sampleOrders: Order[] = [
  {
    id: "order-1",
    desc: "Pasta Carbonara with extra cheese",
    userName: "Alex",
    status: "ordering",
  },
  {
    id: "order-2",
    desc: "Margherita Pizza, no basil",
    userName: "Jamie",
    status: "decided",
  },
  {
    id: "order-3",
    desc: "Chicken Caesar Salad, dressing on the side",
    userName: "Taylor",
    status: "cooking",
  },
  {
    id: "order-4",
    desc: "Chocolate Lava Cake with vanilla ice cream",
    userName: "Morgan",
    status: "finished",
  },
  {
    id: "order-5",
    desc: "Vegetable Stir Fry, spicy",
    userName: "Casey",
    status: "decided",
  },
]

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useAtom(ordersAtom);

  const setAsCooking = (orderId: string) =>
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "cooking" } : order
      )
    );

  const setAsFinished = (orderId: string) =>
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "finished" } : order
      )
    );

  const removeOrder = (orderId: string) =>
    setOrders((prev) => prev.filter((order) => order.id !== orderId));


  return (
    <OrdersContext.Provider value={{ orders, setAsCooking, setAsFinished, removeOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

// Custom hook to use the orders context
export function useOrders(): OrdersContextType {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}
