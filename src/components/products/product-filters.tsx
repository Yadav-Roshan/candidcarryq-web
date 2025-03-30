"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const CATEGORIES = [
  { id: "backpacks", label: "Backpacks" },
  { id: "handbags", label: "Handbags" },
  { id: "wallets", label: "Wallets" },
  { id: "travel", label: "Travel" },
  { id: "accessories", label: "Accessories" },
];

const COLORS = [
  { id: "black", label: "Black" },
  { id: "brown", label: "Brown" },
  { id: "navy", label: "Navy" },
  { id: "tan", label: "Tan" },
  { id: "red", label: "Red" },
  { id: "green", label: "Green" },
];

const MATERIALS = [
  { id: "leather", label: "Leather" },
  { id: "canvas", label: "Canvas" },
  { id: "nylon", label: "Nylon" },
  { id: "polyester", label: "Polyester" },
  { id: "cotton", label: "Cotton" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "popular", label: "Most Popular" },
];

export function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Initialize filter state from URL
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    priceRange: [
      Number(searchParams.get("minPrice") || 0),
      Number(searchParams.get("maxPrice") || 10000),
    ],
    colors: (searchParams.get("colors")?.split(",") || []),
    materials: (searchParams.get("materials")?.split(",") || []),
    sort: searchParams.get("sort") || "newest",
  })
  
  // Price range display
  const [minPrice, maxPrice] = filters.priceRange;

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    // Add each filter to params if it has a value
    if (filters.category) params.set("category", filters.category)
    if (filters.priceRange[0] > 0) params.set("minPrice", filters.priceRange[0].toString())
    if (filters.priceRange[1] < 10000) params.set("maxPrice", filters.priceRange[1].toString())
    if (filters.colors.length) params.set("colors", filters.colors.join(","))
    if (filters.materials.length) params.set("materials", filters.materials.join(","))
    if (filters.sort !== "newest") params.set("sort", filters.sort)
    
    // Navigate to the current path with updated query params
    router.push(`${pathname}?${params.toString()}`)
  }
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "",
      priceRange: [0, 10000],
      colors: [],
      materials: [],
      sort: "newest",
    })
    
    router.push(pathname)
  }
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? "" : category
    }))
  }
  
  // Handle price range change
  const handlePriceChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: values
    }))
  }
  
  // Handle color toggle
  const handleColorToggle = (colorId: string) => {
    setFilters(prev => {
      const isSelected = prev.colors.includes(colorId)
      return {
        ...prev,
        colors: isSelected
          ? prev.colors.filter(id => id !== colorId)
          : [...prev.colors, colorId]
      }
    })
  }
  
  // Handle material toggle
  const handleMaterialToggle = (materialId: string) => {
    setFilters(prev => {
      const isSelected = prev.materials.includes(materialId)
      return {
        ...prev,
        materials: isSelected
          ? prev.materials.filter(id => id !== materialId)
          : [...prev.materials, materialId]
      }
    })
  }
  
  // Handle sort option change
  const handleSortChange = (sortId: string) => {
    setFilters(prev => ({
      ...prev,
      sort: sortId
    }))
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Filters</h3>
        
        <div className="flex justify-between mb-4">
          <Button 
            onClick={applyFilters} 
            className="w-1/2"
          >
            Apply Filters
          </Button>
          <Button 
            onClick={resetFilters} 
            variant="outline"
            className="w-[48%]"
          >
            Reset
          </Button>
        </div>
      </div>
      
      <Accordion type="multiple" defaultValue={["category", "price", "sort"]}>
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {CATEGORIES.map(category => (
                <div className="flex items-center space-x-2" key={category.id}>
                  <Checkbox 
                    id={`category-${category.id}`}
                    checked={filters.category === category.id}
                    onCheckedChange={() => handleCategoryChange(category.id)}
                  />
                  <Label 
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[0, 10000]}
                value={filters.priceRange}
                min={0}
                max={10000}
                step={100}
                onValueChange={handlePriceChange}
              />
              
              <div className="flex justify-between">
                <div className="w-[48%]">
                  <Label htmlFor="min-price" className="text-xs">Min</Label>
                  <Input
                    id="min-price"
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceChange([parseInt(e.target.value), maxPrice])}
                    min={0}
                    max={maxPrice}
                    className="text-sm"
                  />
                </div>
                
                <div className="w-[48%]">
                  <Label htmlFor="max-price" className="text-xs">Max</Label>
                  <Input
                    id="max-price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange([minPrice, parseInt(e.target.value)])}
                    min={minPrice}
                    max={10000}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Color Filter */}
        <AccordionItem value="color">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {COLORS.map(color => (
                <div className="flex items-center space-x-2" key={color.id}>
                  <Checkbox 
                    id={`color-${color.id}`}
                    checked={filters.colors.includes(color.id)}
                    onCheckedChange={() => handleColorToggle(color.id)}
                  />
                  <Label 
                    htmlFor={`color-${color.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {color.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Material Filter */}
        <AccordionItem value="material">
          <AccordionTrigger>Materials</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {MATERIALS.map(material => (
                <div className="flex items-center space-x-2" key={material.id}>
                  <Checkbox 
                    id={`material-${material.id}`}
                    checked={filters.materials.includes(material.id)}
                    onCheckedChange={() => handleMaterialToggle(material.id)}
                  />
                  <Label 
                    htmlFor={`material-${material.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {material.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Sort Options */}
        <AccordionItem value="sort">
          <AccordionTrigger>Sort By</AccordionTrigger>
          <AccordionContent>
            <RadioGroup 
              value={filters.sort}
              onValueChange={handleSortChange}
              className="space-y-2"
            >
              {SORT_OPTIONS.map(option => (
                <div className="flex items-center space-x-2" key={option.id}>
                  <RadioGroupItem 
                    value={option.id} 
                    id={`sort-${option.id}`}
                  />
                  <Label 
                    htmlFor={`sort-${option.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
