"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProductSort() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentSort = searchParams ? searchParams.get("sort") || "featured" : "featured"
  
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams || "")
    
    if (value && value !== "featured") {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <Select defaultValue={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="rating">Top Rated</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
