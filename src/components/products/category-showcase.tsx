import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryShowcaseProps {
  categories: {
    id: string;
    name: string;
    description: string;
    image?: string;
    count?: number;
  }[];
  className?: string;
}

export default function CategoryShowcase({ categories, className }: CategoryShowcaseProps) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {categories.map((category) => (
        <Link 
          key={category.id}
          href={`/categories/${category.id}`}
          className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow transition-all hover:shadow-md"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {/* Use a placeholder if no image is provided */}
            <div className="bg-muted h-full w-full flex items-center justify-center relative">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-muted-foreground text-lg">{category.name}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-1 flex-col p-4">
            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
            {category.count !== undefined && (
              <p className="text-sm mb-4">
                <span className="font-medium">{category.count}</span> products
              </p>
            )}
            <div className="mt-auto">
              <Button className="w-full">View Collection</Button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
