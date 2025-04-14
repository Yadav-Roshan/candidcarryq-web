"use client"

import Image from "next/image"
import { useState } from "react"
import { Product } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  product: Product
}

export default function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  
  // Use product images or fallback to main image
  const images = product.images || [product.image]
  
  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        <Image
          src={images[selectedImage]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative aspect-square h-20 overflow-hidden rounded-md border",
                selectedImage === index && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
