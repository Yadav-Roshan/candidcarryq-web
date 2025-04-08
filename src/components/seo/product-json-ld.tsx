import { Product } from "@/lib/client/product-service";

export function ProductJsonLd({ product }: { product: Product }) {
  // Format price with currency symbol
  const priceFormatted = `NPR ${product.price.toFixed(2)}`;
  const discountPriceFormatted = product.salePrice 
    ? `NPR ${product.salePrice.toFixed(2)}` 
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "CandidCarryq"
    },
    offers: {
      "@type": "Offer",
      url: `https://candidcarryq.com/products/${product.id}`,
      priceCurrency: "NPR",
      price: product.salePrice || product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: (product.stock ?? 0) > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock"
    },
    aggregateRating: product.rating 
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount || 0
        }
      : undefined
  };

  // Remove undefined properties
  const cleanedJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanedJsonLd) }}
    />
  );
}
