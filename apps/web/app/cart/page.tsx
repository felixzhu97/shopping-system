"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/components/cart-item"
import { Navbar } from "@/components/navbar"
import type { CartItem as CartItemType } from "@/lib/types"

export default function CartPage() {
  // In a real app, this would come from a context or state management
  const [cartItems, setCartItems] = useState<CartItemType[]>([
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      price: 79.99,
      quantity: 1,
      image: "/placeholder.svg?height=200&width=200&text=Headphones",
    },
    {
      id: "2",
      name: "Smart Watch with Heart Rate Monitor",
      price: 129.99,
      quantity: 2,
      image: "/placeholder.svg?height=200&width=200&text=Watch",
    },
  ])

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const shipping = subtotal > 35 ? 0 : 5.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <CartItem key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full" size="lg">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Checkout
                    </Button>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      or
                      <Link href="/products" className="ml-1 text-primary hover:underline">
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/40 flex-col items-start text-sm">
                  <h4 className="font-medium mb-2">Have a promo code?</h4>
                  <div className="flex w-full gap-2">
                    <Input placeholder="Enter code" className="h-9" />
                    <Button variant="secondary" size="sm" className="h-9">
                      Apply
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild size="lg">
              <Link href="/products">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Amazon Clone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
