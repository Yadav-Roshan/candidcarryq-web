import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/api"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Share2, ShoppingBag, Star } from "lucide-react"
import AddToCartButton from "@/components/products/add-to-cart-button"
import ProductGrid from "@/components/products/product-grid"
import { Badge } from "@/components/ui/badge"
import ProductImageGallery from "@/components/products/product-image-gallery"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)
  
  if (!product) {
    return {
      title: "Product Not Found",
    }
  }
  
  return {
    title: `${product.name} | CandidWear`,
    description: product.description,
    openGraph: {
      images: [{ url: product.image }],
    },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)
  
  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(params.id, product.category)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/products">Products</BreadcrumbLink>
        </BreadcrumbItem>
        {product.category && (
          <BreadcrumbItem>
            <BreadcrumbLink href={`/categories/${product.category}`}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href="#">{product.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="sticky top-24">
          <ProductImageGallery product={product} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.salePrice && (
              <Badge variant="destructive" className="mb-2">
                Sale
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`h-4 w-4 ${
                      rating <= (product.rating || 5)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.reviewCount || 0} reviews
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-bold text-primary">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {/* Color & Size Options */}
          {product.colors && (
            <div>
              <h3 className="mb-2 font-medium">Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`h-8 w-8 rounded-full border p-1`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && (
            <div>
              <h3 className="mb-2 font-medium">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <Button key={size} variant="outline" size="sm">
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="flex gap-4 pt-4">
            <AddToCartButton product={product} />
            <Button size="icon" variant="outline">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Add to wishlist</span>
            </Button>
          </div>

          {/* Product details */}
          <Tabs defaultValue="details" className="mt-8">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 pt-4">
              <p>{product.fullDescription || product.description}</p>
              <ul className="ml-6 list-disc">
                <li>Premium quality material</li>
                <li>Durable construction</li>
                <li>Comfortable to carry</li>
                <li>Stylish design</li>
              </ul>
            </TabsContent>
            <TabsContent value="specs" className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Dimensions</div>
                  <div className="text-sm">
                    {product.dimensions || "12\" x 8\" x 16\" (H x W x D)"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Material</div>
                  <div className="text-sm">{product.material || "Premium leather"}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Capacity</div>
                  <div className="text-sm">{product.capacity || "15L"}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Weight</div>
                  <div className="text-sm">{product.weight || "1.2 kg"}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Care</div>
                  <div className="text-sm">Wipe clean with damp cloth</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
              <div className="space-y-6">
                {/* Reviews would be dynamically loaded here */}
                <p>No reviews yet. Be the first to review this product!</p>
                <Button>Write a Review</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related products */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">You Might Also Like</h2>
        <Suspense>
          <ProductGrid products={relatedProducts} />
        </Suspense>
      </div>
    </div>
  )
}
