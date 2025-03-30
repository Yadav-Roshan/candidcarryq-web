"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ChevronDown, ChevronUp } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CountryCodeSelect } from "@/components/ui/country-code-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Nepal provinces for dropdown
const nepalProvinces = [
  { value: "province1", label: "Province 1" },
  { value: "madhesh", label: "Madhesh Province" },
  { value: "bagmati", label: "Bagmati Province" },
  { value: "gandaki", label: "Gandaki Province" },
  { value: "lumbini", label: "Lumbini Province" },
  { value: "karnali", label: "Karnali Province" },
  { value: "sudurpaschim", label: "Sudurpaschim Province" },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    address: {
      buildingName: "",
      locality: "",
      wardNo: "",
      postalCode: "",
      district: "",
      province: "bagmati", // Default to Bagmati
      country: "Nepal",
      landmark: "",
    }
  })
  const [countryCode, setCountryCode] = useState("+977") // Default to Nepal
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isAddressExpanded, setIsAddressExpanded] = useState(false)
  
  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPath = searchParams.get("from") || "/"
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user types
    if (error) setError("")
  }
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }))
    
    // Clear error when user types
    if (error) setError("")
  }
  
  const handleProvinceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        province: value
      }
    }))
  }
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return false
    }
    
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError("Please enter a valid email")
      return false
    }
    
    // Phone number validation - Make it mandatory
    if (!formData.phoneNumber) {
      setError("Phone number is required")
      return false
    }
    
    // Remove any non-numeric characters from phone input
    const phoneDigits = formData.phoneNumber.replace(/\D/g, '')
    if (phoneDigits.length < 7) {
      setError("Phone number is too short")
      return false
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    
    // Address validation remains optional
    if (isAddressExpanded) {
      // If any of these are filled, require the whole set
      if (formData.address.locality || formData.address.district || formData.address.postalCode) {
        if (!formData.address.locality) {
          setError("Locality/Area is required")
          return false
        }
        
        if (!formData.address.district) {
          setError("District is required")
          return false
        }
        
        if (!formData.address.postalCode) {
          setError("Postal code is required")
          return false
        }
      }
    }
    
    return true
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Format phone number with country code
    const formattedPhoneNumber = `${countryCode}${formData.phoneNumber.startsWith('0') 
      ? formData.phoneNumber.substring(1) 
      : formData.phoneNumber}`
    
    setIsSubmitting(true)
    
    try {
      // Prepare the user data
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formattedPhoneNumber,
        // Only include address if it was expanded and filled
        address: isAddressExpanded ? formData.address : undefined
      }
      
      const success = await register(userData)
      
      if (success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created!",
        })
        
        // Navigate to the intended destination
        router.push(fromPath)
        router.refresh() // Force refresh to ensure auth state is updated
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (error: any) {
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container py-10 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex-shrink-0">
                  <CountryCodeSelect 
                    value={countryCode} 
                    onChange={setCountryCode} 
                  />
                </div>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="98XXXXXXXX"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="flex-grow"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your phone number without the country code
              </p>
            </div>
            
            {/* Collapsible Address Section */}
            <Collapsible
              open={isAddressExpanded}
              onOpenChange={setIsAddressExpanded}
              className="border rounded-md p-4"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center cursor-pointer">
                  <Label className="text-sm font-medium">Address Information (Optional)</Label>
                  <Button variant="ghost" size="sm" type="button">
                    {isAddressExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="buildingName">Building Name/Number</Label>
                  <Input
                    id="buildingName"
                    name="buildingName"
                    placeholder="Apartment 3B, XYZ Building"
                    value={formData.address.buildingName}
                    onChange={handleAddressChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="locality">Locality/Area</Label>
                  <Input
                    id="locality"
                    name="locality"
                    placeholder="Thamel, New Road"
                    value={formData.address.locality}
                    onChange={handleAddressChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wardNo">Ward No.</Label>
                    <Input
                      id="wardNo"
                      name="wardNo"
                      placeholder="14"
                      value={formData.address.wardNo}
                      onChange={handleAddressChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="44600"
                      value={formData.address.postalCode}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    name="district"
                    placeholder="Kathmandu"
                    value={formData.address.district}
                    onChange={handleAddressChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select 
                    onValueChange={handleProvinceChange} 
                    defaultValue={formData.address.province}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a province" />
                    </SelectTrigger>
                    <SelectContent>
                      {nepalProvinces.map((province) => (
                        <SelectItem key={province.value} value={province.value}>
                          {province.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    name="landmark"
                    placeholder="Near Central Mall"
                    value={formData.address.landmark}
                    onChange={handleAddressChange}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
