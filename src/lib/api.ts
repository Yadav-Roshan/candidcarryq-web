import { Product } from "@/contexts/cart-context"

// Mock data for products
const mockProductsData = [
  {
    id: "1",
    name: "Classic Leather Backpack",
    price: 129.99,
    image: "https://placehold.co/600x600?text=Backpack",
    description: "A timeless leather backpack with multiple compartments for everyday use.",
    category: "backpacks",
    rating: 4.5,
    reviewCount: 12,
    salePrice: null,
    colors: ["black", "brown", "navy"],
    sizes: ["medium", "large"],
    material: "Premium leather",
    dimensions: "16\" x 12\" x 6\"",
    weight: "1.8 kg",
    capacity: "22L",
    fullDescription: "This classic leather backpack combines style and functionality. Made from premium leather, it features a spacious main compartment, a padded laptop sleeve, and multiple organizational pockets. The adjustable shoulder straps and padded back panel ensure comfortable carrying all day long.",
    images: [
      "https://placehold.co/600x600?text=Backpack",
      "https://placehold.co/600x600?text=Backpack-2",
      "https://placehold.co/600x600?text=Backpack-3",
      "https://placehold.co/600x600?text=Backpack-4",
    ]
  },
  {
    id: "2",
    name: "Urban Canvas Tote",
    price: 79.99,
    salePrice: 59.99,
    image: "https://placehold.co/600x600?text=Tote",
    description: "Stylish canvas tote with leather trim, perfect for daily errands or casual outings.",
    category: "handbags",
    rating: 4.0,
    reviewCount: 8
  },
  {
    id: "3",
    name: "Weekend Travel Duffel",
    price: 149.99,
    image: "https://placehold.co/600x600?text=Duffel",
    description: "Spacious duffel bag with multiple compartments for weekend getaways.",
    category: "travel",
    rating: 4.8,
    reviewCount: 15
  },
  {
    id: "4",
    name: "Minimalist Leather Wallet",
    price: 49.99,
    image: "https://placehold.co/600x600?text=Wallet",
    description: "Slim leather wallet with RFID protection for essential cards and cash.",
    category: "accessories",
    rating: 4.2,
    reviewCount: 23
  },
  {
    id: "5",
    name: "Everyday Messenger Bag",
    price: 119.99,
    image: "https://placehold.co/600x600?text=Messenger",
    description: "Versatile messenger bag with adjustable strap and water-resistant finish.",
    category: "backpacks",
    rating: 4.3,
    reviewCount: 9
  },
  {
    id: "6",
    name: "Luxury Crossbody Bag",
    price: 199.99,
    salePrice: 159.99,
    image: "https://placehold.co/600x600?text=Crossbody",
    description: "Elegant crossbody bag with gold hardware and adjustable chain strap.",
    category: "handbags",
    rating: 4.6,
    reviewCount: 18
  },
  {
    id: "7",
    name: "Adventure Hiking Backpack",
    price: 179.99,
    image: "https://placehold.co/600x600?text=Hiking",
    description: "Durable backpack with hydration system and multiple attachment points for outdoor adventures.",
    category: "backpacks",
    rating: 4.9,
    reviewCount: 27
  },
  {
    id: "8",
    name: "Business Laptop Bag",
    price: 159.99,
    image: "https://placehold.co/600x600?text=Laptop",
    description: "Professional laptop bag with padded compartment and organization features.",
    category: "travel",
    rating: 4.4,
    reviewCount: 14
  }
];

// Normalize the mock products data to avoid duplication
export const mockProducts = mockProductsData.map(product => ({
  ...product,
  featured: ["1", "2", "6", "9"].includes(product.id),
  stock: product.id === "10" ? 0 : Math.floor(Math.random() * 20) + 5,
  createdAt: product.id === "7" ? "2023-10-20T00:00:00Z" : `2023-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 28) + 1}T00:00:00Z`,
  soldCount: Math.floor(Math.random() * 100) + 10
}));

interface ProductQueryParams {
  page?: number;
  category?: string;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  colors?: string[];
}

// Function to simulate API request delay
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Get all products with filtering and sorting
export async function getAllProducts(
  options: {
    page?: number;
    limit?: number;
    category?: string;
    sort?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}
): Promise<Product[]> {
  await simulateDelay();
  
  const {
    page = 1,
    limit = 12,
    category,
    sort = "newest",
    search = "",
    minPrice,
    maxPrice,
  } = options;

  // Filter products
  let filteredProducts = [...mockProducts];
  
  if (category) {
    filteredProducts = filteredProducts.filter(product => product.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower) || 
      product.description?.toLowerCase().includes(searchLower)
    );
  }
  
  if (minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      (product.salePrice || product.price) >= minPrice
    );
  }
  
  if (maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      (product.salePrice || product.price) <= maxPrice
    );
  }

  // Sort products
  if (sort === "price-low") {
    filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  } else if (sort === "price-high") {
    filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  } else if (sort === "rating") {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sort === "popular") {
    filteredProducts.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  }
  
  // Pagination
  const start = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(start, start + limit);
  
  return paginatedProducts;
}

// Get featured products for homepage
export async function getFeaturedProducts(): Promise<Product[]> {
  await simulateDelay();
  // Return a subset of products as featured
  return mockProducts.slice(0, 4);
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  await simulateDelay();
  const product = mockProducts.find(product => product.id === id);
  return product || null;
}

// Get related products (same category, excluding current product)
export async function getRelatedProducts(productId: string, category?: string): Promise<Product[]> {
  await simulateDelay();
  
  // If no category, return random products
  if (!category) {
    return mockProducts
      .filter(product => product.id !== productId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }
  
  // Filter by same category, exclude current product
  const relatedProducts = mockProducts.filter(
    product => product.category === category && product.id !== productId
  );
  
  // If not enough related products in the same category, add some random ones
  if (relatedProducts.length < 4) {
    const additionalProducts = mockProducts
      .filter(product => product.id !== productId && product.category !== category)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 - relatedProducts.length);
    
    return [...relatedProducts, ...additionalProducts];
  }
  
  return relatedProducts.slice(0, 4);
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  await simulateDelay();
  
  if (!query) return [];
  
  const searchLower = query.toLowerCase();
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchLower) || 
    product.description?.toLowerCase().includes(searchLower)
  );
}
