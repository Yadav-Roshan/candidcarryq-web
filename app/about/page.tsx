import React from "react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About CandidWear</h1>
        
        <div className="relative aspect-video w-full mb-8 overflow-hidden rounded-lg">
          <Image
            src="https://images.unsplash.com/photo-1576851444184-9470561c9920?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
            alt="CandidWear team"
            fill
            className="object-cover"
          />
        </div>
        
        <p className="mb-6 text-lg">
          CandidWear is a premium destination for high-quality bags and accessories. Founded in 2023, we've made it our mission to provide stylish, functional, and durable bags for every occasion.
        </p>
        
        <h2 className="text-2xl font-bold mb-4">Our Story</h2>
        <p className="mb-6">
          The idea for  was born when our founder struggled to find the perfect bag that combined quality craftsmanship, modern design, and practical functionality. After years in the fashion industry, she decided to create a brand that would focus solely on delivering exceptional bags to discerning customers.
        </p>
        
        <h2 className="text-2xl font-bold mb-4">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-lg border p-4">
            <h3 className="font-bold mb-2">Quality</h3>
            <p className="text-sm text-muted-foreground">
              We never compromise on materials or craftsmanship. Each product is carefully inspected to ensure it meets our high standards.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-bold mb-2">Sustainability</h3>
            <p className="text-sm text-muted-foreground">
              We're committed to reducing our environmental impact by using eco-friendly materials and ethical manufacturing processes.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-bold mb-2">Innovation</h3>
            <p className="text-sm text-muted-foreground">
              We continuously explore new designs, materials, and features to create bags that enhance your daily life.
            </p>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Our Promise</h2>
        <p className="mb-8">
          When you purchase from CandidWear, you're not just buying a bag; you're investing in a product that's designed to last and enhance your life. We stand behind everything we sell with our satisfaction guarantee.
        </p>
        
        <div className="bg-muted rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
          <p className="mb-4">
            Follow us on social media for the latest updates, special offers, and style inspiration.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-primary">Instagram</a>
            <a href="#" className="hover:text-primary">Facebook</a>
            <a href="#" className="hover:text-primary">Twitter</a>
          </div>
        </div>
      </div>
    </div>
  )
}
