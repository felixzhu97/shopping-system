"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import NextImage from "next/image"

export interface ImageProps extends React.ComponentPropsWithoutRef<"img"> {
  fallbackSrc?: string
  fallbackAlt?: string
  wrapperClassName?: string
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt = "", fallbackSrc, fallbackAlt, wrapperClassName, ...props }, ref) => {
    const [error, setError] = React.useState(false)
    
    const handleError = () => {
      setError(true)
    }
    
    return (
      <div className={cn("relative overflow-hidden", wrapperClassName)}>
        {error || !src ? (
          <img
            className={cn("object-cover transition-opacity", className)}
            src={fallbackSrc || `/placeholder.svg?height=300&width=300&text=${fallbackAlt || alt}`}
            alt={fallbackAlt || alt}
            ref={ref}
            {...props}
          />
        ) : (
          <img
            className={cn("object-cover transition-opacity", className)}
            src={src}
            alt={alt}
            onError={handleError}
            ref={ref}
            {...props}
          />
        )}
      </div>
    )
  }
)

Image.displayName = "Image"

export default Image 