import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { Navbar } from "@/components/navbar"
import { featuredProducts } from "@/lib/products"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-200 h-[400px] w-full">
            <div className="container mx-auto px-4 py-24">
              <div className="max-w-xl">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
                  Shop the best deals
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Discover amazing products at unbeatable prices. Free shipping on qualified orders.
                </p>
                <Button asChild size="lg">
                  <Link href="/products">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Electronics", "Clothing", "Home & Kitchen", "Books"].map((category) => (
                <Card key={category} className="overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src={`/placeholder.svg?height=200&width=300&text=${category}`}
                      alt={category}
                      className="w-full h-40 object-cover"
                    />
                  </CardContent>
                  <CardFooter className="p-4">
                    <Link
                      href={`/products?category=${category.toLowerCase().replace(" & ", "-")}`}
                      className="text-sm font-medium hover:underline w-full text-center"
                    >
                      {category}
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Get to Know Us</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Press Releases
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Make Money with Us</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Sell products
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Become an Affiliate
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Advertise Your Products
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Payment Products</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Business Card
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Shop with Points
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Reload Your Balance
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Let Us Help You</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Your Account
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Your Orders
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Shipping Rates & Policies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Returns & Replacements
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Help
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">© 2025 Amazon Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
