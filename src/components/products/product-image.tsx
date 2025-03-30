"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"

export default function ProductImage({ 
  src, 
  alt, 
  className 
}: { 
  src: string, 
  alt: string, 
  className?: string 
}) {
  const [error, setError] = useState(false)

  return error ? (
    <div className="flex aspect-square w-full items-center justify-center bg-muted">
      <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
    </div>
  ) : (
    <Image
      src={src}
      alt={alt}
      fill
      className={className || "object-cover"}
      onError={() => setError(true)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
