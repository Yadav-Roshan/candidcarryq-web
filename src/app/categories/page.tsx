import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";

export const metadata: Metadata = {
  title: 'Categories - MyBags',
  description: 'Browse our complete collection of bags and accessories by category',
};

// Dummy product data with categories
const products = [
  { id: "1", name: "Urban Commuter Backpack", category: "backpacks", image: "", price: 3500 },
  { id: "2", name: "Laptop Backpack Pro", category: "backpacks", image: "", price: 4200 },
  { id: "3", name: "Leather Messenger Backpack", category: "backpacks", image: "", price: 4800 },
  { id: "4", name: "Designer Tote", category: "handbags", image: "", price: 5600 },
  { id: "5", name: "Evening Clutch", category: "handbags", image: "", price: 2900 },
  { id: "6", name: "Everyday Handbag", category: "handbags", image: "", price: 3800 },
  { id: "7", name: "Business Card Holder", category: "wallets", image: "", price: 1200 },
  { id: "8", name: "Slim Bifold Wallet", category: "wallets", image: "", price: 1600 },
  { id: "9", name: "Weekend Luggage", category: "travel", image: "", price: 7500 },
  { id: "10", name: "Passport Holder", category: "travel", image: "", price: 950 },
];

// Category information with display names and descriptions
const categoryInfo = {
  backpacks: {
    name: "Backpacks",
    description: "Comfortable and spacious backpacks for everyday use and travel."
  },
  handbags: {
    name: "Handbags",
    description: "Stylish handbags and purses for every occasion."
  },
  wallets: {
    name: "Wallets",
    description: "Compact wallets and cardholders made from premium materials."
  },
  travel: {
    name: "Travel Bags",
    description: "Durable luggage and travel accessories for your journeys."
  }
};

export default function CategoriesPage() {
  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // Sort categories by name for consistent display
  const sortedCategories = Object.keys(productsByCategory).sort();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse by Category</h1>
      
      {sortedCategories.map(categoryKey => {
        const info = categoryInfo[categoryKey as keyof typeof categoryInfo];
        const categoryProducts = productsByCategory[categoryKey];
        
        return (
          <section key={categoryKey} className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">{info?.name || categoryKey}</h2>
                <p className="text-muted-foreground">{info?.description}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/products?category=${categoryKey}`}>
                  View All {info?.name || categoryKey}
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoryProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
