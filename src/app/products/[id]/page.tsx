import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetails } from "@/components/products/product-details";
import { ProductReviews } from "@/components/products/product-reviews";
import { ProductRecommendations } from "@/components/products/product-recommendations";
import { getProductById } from "@/lib/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  // Make sure params is resolved before accessing its properties
  const resolvedParams = params instanceof Promise ? await params : params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found",
    };
  }

  return {
    title: `${product.name} - CandidWear`,
    description: product.description || "Product details",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Make sure params is resolved before accessing its properties
  const resolvedParams = params instanceof Promise ? await params : params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-10">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/categories/${product.category}`}
                  className="capitalize"
                >
                  {product.category}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products/${product.id}`} isCurrentPage>
              {product.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main product details */}
      <ProductDetails product={product} />

      {/* Product Reviews - New section */}
      <div className="mt-16">
        <ProductReviews
          productId={product.id}
          reviewCount={product.reviewCount || 0}
        />
      </div>

      {/* Related products */}
      <div className="mt-20">
        <Suspense fallback={<div>Loading recommendations...</div>}>
          <ProductRecommendations
            productId={product.id}
            category={product.category}
          />
        </Suspense>
      </div>
    </div>
  );
}
