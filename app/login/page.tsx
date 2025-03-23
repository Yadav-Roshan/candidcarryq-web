"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PhoneInput } from "@/components/ui/phone-input"
import { findDefaultCountry } from "@/lib/country-codes"

// Form schema
const loginSchema = z.object({
  identifier: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
  isUsingPhone: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isUsingPhone, setIsUsingPhone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("from") || "/account"
  const { login } = useAuth()
  
  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: isUsingPhone ? findDefaultCountry().dial_code : "",
      password: "",
      isUsingPhone: false,
    },
  })
  
  // Toggle between email and phone inputs
  const toggleIdentifierType = () => {
    setIsUsingPhone(!isUsingPhone)
    form.setValue('identifier', isUsingPhone ? "" : findDefaultCountry().dial_code)
    form.setValue('isUsingPhone', !isUsingPhone)
  }
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true)
    setErrorMessage(null)
    
    try {
      const success = await login(data.identifier, data.password)
      
      if (success) {
        router.push(returnTo)
      } else {
        setErrorMessage("Login failed. Please check your credentials.")
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred during login")
    } finally {
      setIsLoggingIn(false)
    }
  }
  
  return (
    <div className="container flex flex-col items-center py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>{isUsingPhone ? "Phone Number" : "Email"}</FormLabel>
                      <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        className="text-xs h-auto p-0"
                        onClick={toggleIdentifierType}
                      >
                        Use {isUsingPhone ? "Email" : "Phone Number"} instead
                      </Button>
                    </div>
                    <FormControl>
                      {isUsingPhone ? (
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <Input 
                          placeholder="Enter your email" 
                          {...field} 
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </form>
          </Form>
          
          
        </div>
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
