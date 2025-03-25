"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Filter, Search, ShoppingBag, SlidersHorizontal } from "lucide-react"

// Mock product data
const products = [
  {
    id: 1,
    name: "Classic Leather Backpack",
    price: 129.99,
    category: "backpacks",
    color: "brown",
    image: "/backpack1.jpg", // These would be actual images in a real app
    description: "Premium leather backpack with multiple compartments.",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Urban Messenger Bag",
    price: 89.99,
    category: "messenger",
    color: "black",
    image: "/messenger1.jpg",
    description: "Stylish messenger bag perfect for commuting.",
    rating: 4.2,
  },
  {
    id: 3,
    name: "Travel Duffle",
    price: 149.99,
    category: "travel",
    color: "navy",
    image: "/duffle1.jpg",
    description: "Spacious duffle bag for weekend getaways.",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Designer Tote Bag",
    price: 199.99,
    category: "totes",
    color: "beige",
    image: "/tote1.jpg",
    description: "Elegant tote bag made from premium materials.",
    rating: 4.8,
  },
  {
    id: 5,
    name: "Laptop Backpack",
    price: 109.99,
    category: "backpacks",
    color: "gray",
    image: "/backpack2.jpg",
    description: "Designed to safely carry laptops up to 15 inches.",
    rating: 4.4,
  },
  {
    id: 6,
    name: "Crossbody Purse",
    price: 79.99,
    category: "purses",
    color: "red",
    image: "/purse1.jpg",
    description: "Compact crossbody purse for essentials on the go.",
    rating: 4.3,
  },
  {
    id: 7,
    name: "Canvas Backpack",
    price: 69.99,
    category: "backpacks",
    color: "green",
    image: "/backpack3.jpg",
    description: "Durable canvas backpack for everyday adventures.",
    rating: 4.1,
  },
  {
    id: 8,
    name: "Leather Handbag",
    price: 159.99,
    category: "handbags",
    color: "brown",
    image: "/handbag1.jpg",
    description: "Classic leather handbag that never goes out of style.",
    rating: 4.6,
  },
]

// Filter options
const categories = ["All", "Backpacks", "Handbags", "Travel", "Messenger", "Totes", "Purses"]
const colors = ["All", "Black", "Brown", "Navy", "Gray", "Beige", "Red", "Green"]
const priceRanges = ["All", "Under NPR50", "NPR50 - NPR100", "NPR100 - NPR150", "Over NPR150"]

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedColor, setSelectedColor] = useState("All")
  const [selectedPrice, setSelectedPrice] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Category filter
    if (selectedCategory !== "All" && product.category !== selectedCategory.toLowerCase()) {
      return false
    }

    // Color filter
    if (selectedColor !== "All" && product.color !== selectedColor.toLowerCase()) {
      return false
    }

    // Price range filter
    if (selectedPrice !== "All") {
      const price = product.price
      if (selectedPrice === "Under $50" && price >= 50) return false
      if (selectedPrice === "$50 - $100" && (price < 50 || price > 100)) return false
      if (selectedPrice === "$100 - $150" && (price < 100 || price > 150)) return false
      if (selectedPrice === "Over $150" && price <= 150) return false
    }

    return true
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Shop All Bags</h1>

      {/* Search and filter toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-[11px] h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            placeholder="Search bags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-muted p-4 rounded-md mb-6 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Category
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category}`}
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm">{category}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Color
              </h3>
              <div className="space-y-2">
                {colors.map((color) => (
                  <div key={color} className="flex items-center">
                    <input
                      type="radio"
                      id={`color-${color}`}
                      name="color"
                      checked={selectedColor === color}
                      onChange={() => setSelectedColor(color)}
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor={`color-${color}`} className="ml-2 text-sm">{color}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Price Range
              </h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <div key={range} className="flex items-center">
                    <input
                      type="radio"
                      id={`price-${range}`}
                      name="price"
                      checked={selectedPrice === range}
                      onChange={() => setSelectedPrice(range)}
                      className="h-4 w-4 text-primary"
                    />
                    <label htmlFor={`price-${range}`} className="ml-2 text-sm">{range}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
                setSelectedColor("All")
                setSelectedPrice("All")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Product grid */}
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden">
              <Link href={`/product/${product.id}`}>
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden">
                  <div className="h-60 bg-muted flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold">NPR{product.price.toFixed(2)}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-yellow-500">★ {product.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
