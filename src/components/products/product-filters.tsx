"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Filter, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { formatNPR } from "@/lib/utils"

// These would typically come from your API, but for now we'll define them statically
const categories = [
  { id: "backpacks", name: "Backpacks" },
  { id: "handbags", name: "Handbags" },
  { id: "luggage", name: "Luggage" },
  { id: "travel", name: "Travel" },
  { id: "totes", name: "Tote Bags" },
  { id: "wallets", name: "Wallets" },
]

// Colors available for filtering
const colors = [
  "Black", "Brown", "Blue", "Gray", "Red", "Green"
]

// Materials for filtering
const materials = [
  "Leather", "Canvas", "Nylon", "Cotton", "Polyester", "Wool"
]

export default function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // State for local filters before applying
  const [localCategory, setLocalCategory] = useState(searchParams.get("category") || "all")
  const [localPriceRange, setLocalPriceRange] = useState<number[]>([
    Number(searchParams.get("minPrice") || 0), 
    Number(searchParams.get("maxPrice") || 10000)
  ])
  const [localColors, setLocalColors] = useState<string[]>(
    searchParams.get("colors")?.split(",") || []
  )
  const [localMaterials, setLocalMaterials] = useState<string[]>(
    searchParams.get("materials")?.split(",") || []
  )

  // Apply filters to the URL
  const applyFilters = () => {
    // ...existing code...
  }
  
  // Reset all filters
  const resetFilters = () => {
    // ...existing code...
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter Products
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Products</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <div className="space-y-6">
            {/* Category Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="category-all" 
                    checked={localCategory === "all"}
                    onCheckedChange={() => setLocalCategory("all")}
                  />
                  <label 
                    htmlFor="category-all"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    All Categories
                  </label>
                </div>
                
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={localCategory === category.id}
                      onCheckedChange={() => setLocalCategory(category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Price Range</h3>
              <Slider 
                defaultValue={localPriceRange}
                value={localPriceRange}
                onValueChange={setLocalPriceRange}
                max={10000}
                step={100}
                className="py-4"
              />
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">{formatNPR(localPriceRange[0])}</p>
                <p className="text-muted-foreground">{formatNPR(localPriceRange[1])}</p>
              </div>
            </div>

            {/* Colors Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Colors</h3>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={localColors.includes(color)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalColors([...localColors, color])
                        } else {
                          setLocalColors(localColors.filter(c => c !== color))
                        }
                      }}
                    />
                    <label
                      htmlFor={`color-${color}`}
                      className="text-sm leading-none"
                    >
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials Filter */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Materials</h3>
              <div className="grid grid-cols-2 gap-2">
                {materials.map((material) => (
                  <div key={material} className="flex items-center space-x-2">
                    <Checkbox
                      id={`material-${material}`}
                      checked={localMaterials.includes(material)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLocalMaterials([...localMaterials, material])
                        } else {
                          setLocalMaterials(localMaterials.filter(m => m !== material))
                        }
                      }}
                    />
                    <label
                      htmlFor={`material-${material}`}
                      className="text-sm leading-none"
                    >
                      {material}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
              <Button onClick={resetFilters} variant="outline" className="flex-1">Reset</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
