import Link from "next/link"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image || `/placeholder.svg?height=300&width=300&text=${product.name}`}
              alt={product.name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-0.5 mt-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}
