"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CountryCodeSelect } from "@/components/ui/country-code-select"
import { useToast } from "@/components/ui/use-toast"

interface PhoneNumberModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (phoneNumber: string) => Promise<void>
}

export function PhoneNumberModal({ 
  open, 
  onClose, 
  onSubmit 
}: PhoneNumberModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+977") // Default to Nepal
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber) {
      setError("Phone number is required")
      return
    }
    
    // Format phone number with country code
    const formattedPhoneNumber = `${countryCode}${phoneNumber.startsWith('0') 
      ? phoneNumber.substring(1) 
      : phoneNumber}`
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(formattedPhoneNumber)
      
      // Reset form
      setPhoneNumber("")
      setError("")
      
      // Close modal
      onClose()
      
      toast({
        title: "Phone number updated",
        description: "Your phone number has been added to your account",
      })
    } catch (error) {
      setError("Failed to update phone number. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Your Phone Number</DialogTitle>
          <DialogDescription>
            Please add your phone number to continue
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex-shrink-0">
                  <CountryCodeSelect 
                    value={countryCode} 
                    onChange={setCountryCode} 
                  />
                </div>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="flex-grow"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your phone number without the country code
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
