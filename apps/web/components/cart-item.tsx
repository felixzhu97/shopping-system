"use client"

import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
        <img
          src={item.image || `/placeholder.svg?height=200&width=200&text=${item.name}`}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">{item.name}</h3>
          <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center border rounded">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-8"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
