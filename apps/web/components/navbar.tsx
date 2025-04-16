"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Menu, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const { cartItems } = { cartItems: [] } // In a real app, this would come from useCart()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic
    console.log("Searching for:", searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-lg font-semibold">
                Home
              </Link>
              <Link href="/products" className="text-lg font-semibold">
                All Products
              </Link>
              <Link href="/products?category=electronics" className="text-lg">
                Electronics
              </Link>
              <Link href="/products?category=clothing" className="text-lg">
                Clothing
              </Link>
              <Link href="/products?category=home-kitchen" className="text-lg">
                Home & Kitchen
              </Link>
              <Link href="/products?category=books" className="text-lg">
                Books
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center space-x-2">
          <span className="text-xl font-bold">AmazonClone</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
            All Products
          </Link>
          <Link
            href="/products?category=electronics"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Electronics
          </Link>
          <Link
            href="/products?category=clothing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Clothing
          </Link>
          <Link
            href="/products?category=home-kitchen"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Home & Kitchen
          </Link>
          <Link
            href="/products?category=books"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Books
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex-1 md:flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pl-8 rounded-l-md rounded-r-none border-r-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="rounded-l-none">
            Search
          </Button>
        </form>

        {/* User and cart */}
        <div className="flex items-center space-x-4">
          <Link href="/account">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
