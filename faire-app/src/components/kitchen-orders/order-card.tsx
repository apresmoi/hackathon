"use client"

import { useState } from "react"
import { type Order, useOrders } from "./orders-provider"
import { MoreVertical, Check, Trash2, ChefHat } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const { setAsCooking, setAsFinished, removeOrder } = useOrders()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Status badge styling
  const statusStyles = {
    ordering: "bg-amber-500 hover:bg-amber-600",
    decided: "bg-blue-500 hover:bg-blue-600",
    cooking: "bg-orange-500 hover:bg-orange-600",
    finished: "bg-green-500 hover:bg-green-600",
  }

  // Determine available actions based on status
  const canSetAsCooking = order.status === "ordering" || order.status === "decided"
  const canSetAsFinished = order.status === "cooking"
  const canRemove = order.status !== "cooking" // Can remove if not currently cooking

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <Badge className={statusStyles[order.status]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <h3 className="font-semibold text-lg mt-2">{order.userName}</h3>
        </div>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-slate-100" aria-label="Order actions">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canSetAsCooking && (
              <DropdownMenuItem
                onClick={() => {
                  setAsCooking(order.id)
                  setIsMenuOpen(false)
                }}
                className="cursor-pointer"
              >
                <ChefHat className="mr-2 h-4 w-4" />
                <span>Set as Cooking</span>
              </DropdownMenuItem>
            )}
            {canSetAsFinished && (
              <DropdownMenuItem
                onClick={() => {
                  setAsFinished(order.id)
                  setIsMenuOpen(false)
                }}
                className="cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4" />
                <span>Set as Finished</span>
              </DropdownMenuItem>
            )}
            {canRemove && (
              <DropdownMenuItem
                onClick={() => {
                  removeOrder(order.id)
                  setIsMenuOpen(false)
                }}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Remove Order</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700">{order.desc}</p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex gap-2">
          {canSetAsCooking && (
            <button
              onClick={() => setAsCooking(order.id)}
              className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
              aria-label="Start cooking"
            >
              <ChefHat className="h-4 w-4 inline mr-1" />
              Cook
            </button>
          )}
          {canSetAsFinished && (
            <button
              onClick={() => setAsFinished(order.id)}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              aria-label="Mark as finished"
            >
              <Check className="h-4 w-4 inline mr-1" />
              Finish
            </button>
          )}
        </div>
        {canRemove && (
          <button
            onClick={() => removeOrder(order.id)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            aria-label="Remove order"
          >
            <Trash2 className="h-4 w-4 inline mr-1" />
            Remove
          </button>
        )}
      </CardFooter>
    </Card>
  )
}
