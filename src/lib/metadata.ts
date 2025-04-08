import { Metadata } from "next";

// Base metadata that will be used across the site
export const siteConfig = {
  name: "CandidCarryq",
  description: "Premium quality bags and accessories for every lifestyle",
  url: "https://candidcarryq.com", // Replace with your actual domain
  ogImage: "https://candidcarryq.com/og-image.jpg", // Create this image for social sharing
};

// Helper to generate SEO-friendly metadata for any page
export function generateMetadata({
  title,
  description,
  path = "",
  product = null,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  product?: any;
  noIndex?: boolean;
}): Metadata {
  const metaTitle = title 
    ? `${title} | ${siteConfig.name}` 
    : siteConfig.name;
  
  const metaDescription = description || siteConfig.description;
  const url = `${siteConfig.url}${path}`;

  // Basic metadata for all pages
  const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [siteConfig.ogImage],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };

  // Add product-specific metadata if provided
  if (product) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "product",
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    };
  }

  return metadata;
}
