import { Suspense } from "react"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "@/components/product-card"
import { Navbar } from "@/components/navbar"
import { allProducts } from "@/lib/products"

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; q?: string }
}) {
  const category = searchParams.category
  const sort = searchParams.sort || "featured"
  const query = searchParams.q || ""

  // Filter products based on category and search query
  let filteredProducts = [...allProducts]

  if (category) {
    filteredProducts = filteredProducts.filter((product) => product.category.toLowerCase() === category.toLowerCase())
  }

  if (query) {
    filteredProducts = filteredProducts.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
  }

  // Sort products
  switch (sort) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price)
      break
    case "rating":
      filteredProducts.sort((a, b) => b.rating - a.rating)
      break
    // Default is "featured", no sorting needed
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <SlidersHorizontal className="h-5 w-5" />
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Category</h3>
                    <div className="space-y-1">
                      {["All", "Electronics", "Clothing", "Home & Kitchen", "Books"].map((cat) => (
                        <div key={cat} className="flex items-center">
                          <input
                            type="radio"
                            id={cat.toLowerCase()}
                            name="category"
                            className="mr-2"
                            defaultChecked={
                              cat === "All" ? !category : category === cat.toLowerCase().replace(" & ", "-")
                            }
                          />
                          <label htmlFor={cat.toLowerCase()} className="text-sm">
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Price Range</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="Min" className="text-sm" />
                      <Input type="number" placeholder="Max" className="text-sm" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Rating</h3>
                    <div className="space-y-1">
                      {[4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center">
                          <input type="checkbox" id={`rating-${rating}`} className="mr-2" />
                          <label htmlFor={`rating-${rating}`} className="text-sm">
                            {rating}+ Stars
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">Apply Filters</Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {category ? category.charAt(0).toUpperCase() + category.slice(1).replace("-", " & ") : "All Products"}
              </h1>

              <Select defaultValue={sort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Suspense fallback={<ProductsGridSkeleton />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </Suspense>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Amazon Clone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-[300px] w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
