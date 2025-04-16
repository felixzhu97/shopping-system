import Link from "next/link"
import { ChevronRight, Minus, Plus, ShoppingCart, Star, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { allProducts } from "@/lib/products"

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = allProducts.find((p) => p.id === params.id)

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/products">Back to Products</Link>
          </Button>
        </main>
      </div>
    )
  }

  // Get related products (same category)
  const relatedProducts = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link
                href={`/products?category=${product.category.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground"
              >
                {product.category}
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product details */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product image */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="aspect-square overflow-hidden rounded-md">
              <img
                src={product.image || `/placeholder.svg?height=600&width=600&text=${product.name}`}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center mt-2 mb-4">
              <div className="flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-6">
              <div className="flex items-center text-sm text-green-600">
                <Truck className="h-4 w-4 mr-2" />
                <span>Free shipping on orders over $35</span>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Quantity</div>
                <div className="flex items-center border rounded w-fit">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none">
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className="w-12 text-center">1</span>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="sm:flex-1">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="secondary" className="sm:flex-1">
                  Buy Now
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Product Description</h3>
                <p className="text-muted-foreground">
                  {product.description ||
                    "This premium product offers exceptional quality and value. Perfect for everyday use, it combines durability with elegant design. Made from high-quality materials, it's built to last while maintaining its stylish appearance."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <div className="prose max-w-none">
                <p>
                  Experience the ultimate in quality and performance with the {product.name}. Designed with the user in
                  mind, this product combines innovative features with reliable functionality to deliver an exceptional
                  experience every time.
                </p>
                <p>
                  Whether you're a professional or a casual user, the {product.name} adapts to your needs, providing
                  consistent results in any situation. Its intuitive design makes it easy to use, while its robust
                  construction ensures it will stand the test of time.
                </p>
                <ul>
                  <li>Premium quality materials</li>
                  <li>Ergonomic design for comfort</li>
                  <li>Versatile functionality</li>
                  <li>Long-lasting durability</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Dimensions</h3>
                  <p className="text-sm">10.5 x 7.2 x 3.6 inches</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Weight</h3>
                  <p className="text-sm">1.2 pounds</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Material</h3>
                  <p className="text-sm">Premium-grade aluminum and polymer</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Warranty</h3>
                  <p className="text-sm">1-year limited warranty</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {[
                  {
                    name: "Alex Johnson",
                    rating: 5,
                    date: "2 months ago",
                    comment:
                      "Absolutely love this product! It exceeded all my expectations and has made my life so much easier.",
                  },
                  {
                    name: "Sam Taylor",
                    rating: 4,
                    date: "3 months ago",
                    comment: "Great quality for the price. Would definitely recommend to friends and family.",
                  },
                  {
                    name: "Jordan Lee",
                    rating: 3,
                    date: "4 months ago",
                    comment: "Decent product. Does what it says, but nothing extraordinary. Shipping was fast though.",
                  },
                ].map((review, index) => (
                  <div key={index} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{review.name}</h4>
                        <div className="flex items-center mt-1">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Amazon Clone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
