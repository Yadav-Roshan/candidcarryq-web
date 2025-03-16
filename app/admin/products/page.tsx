"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Metadata } from "next"
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  ExternalLink, 
  Filter, 
  ArrowDownUp 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { mockProducts } from "@/lib/api" // Using mock data for now

export const metadata: Metadata = {
  title: "Products - MyBags Admin",
  description: "Manage your product inventory",
}

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const router = useRouter()
  const { toast } = useToast()
  
  // Delete product handler (would connect to API in production)
  const handleDelete = (productId: string) => {
    setProducts(products.filter(product => product.id !== productId))
    
    toast({
      title: "Product deleted",
      description: "The product has been successfully deleted",
    })
  }
  
  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortBy) return 0
    
    let compareA, compareB
    
    switch(sortBy) {
      case "name":
        compareA = a.name.toLowerCase()
        compareB = b.name.toLowerCase()
        break
      case "price":
        compareA = a.salePrice || a.price
        compareB = b.salePrice || b.price
        break
      case "category":
        compareA = a.category?.toLowerCase() || ''
        compareB = b.category?.toLowerCase() || ''
        break
      default:
        return 0
    }
    
    if (compareA < compareB) return sortDir === "asc" ? -1 : 1
    if (compareA > compareB) return sortDir === "asc" ? 1 : -1
    return 0
  })
  
  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortDir("asc")
    }
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Link>
        </Button>
      </div>
      
      <div className="mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort("name")}>
              Sort by Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("price")}>
              Sort by Price
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("category")}>
              Sort by Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="text-xs text-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {product.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <span className="capitalize">{product.category}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.salePrice ? (
                      <div>
                        <div className="font-medium">{formatPrice(product.salePrice)}</div>
                        <div className="text-xs line-through text-muted-foreground">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium">{formatPrice(product.price)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.salePrice && (
                      <Badge className="bg-green-500">On Sale</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
