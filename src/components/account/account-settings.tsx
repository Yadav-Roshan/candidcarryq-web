"use client"

import { useState } from "react"
import { EyeOff, Eye, Bell, BellOff, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

export function AccountSettings() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  // Show/hide password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    orderUpdates: true,
    promotions: true,
    newArrivals: false,
    blogPosts: false,
  })
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      })
      return
    }
    
    // Password change logic would go here
    // For now, we'll just show a success message
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully",
    })
    
    // Reset form
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }
  
  const handleToggleNotification = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    
    toast({
      title: "Preferences updated",
      description: "Your notification preferences have been saved",
    })
  }
  
  const handleSignOut = () => {
    logout()
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    })
    router.push("/")
  }
  
  const handleDeleteAccount = () => {
    // This would typically show a confirmation dialog
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully",
      })
      
      // Log the user out
      setTimeout(() => {
        logout()
      }, 2000)
    }
  }
  
  return (
    <div className="grid gap-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showCurrentPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showNewPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how and when we contact you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your orders
                </p>
              </div>
              <Switch
                checked={notificationPrefs.orderUpdates}
                onCheckedChange={() => handleToggleNotification("orderUpdates")}
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label>Promotions and Discounts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about sales and special offers
                </p>
              </div>
              <Switch
                checked={notificationPrefs.promotions}
                onCheckedChange={() => handleToggleNotification("promotions")}
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label>New Arrivals</Label>
                <p className="text-sm text-muted-foreground">
                  Be the first to know about new products
                </p>
              </div>
              <Switch
                checked={notificationPrefs.newArrivals}
                onCheckedChange={() => handleToggleNotification("newArrivals")}
              />
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <Label>Blog Posts and News</Label>
                <p className="text-sm text-muted-foreground">
                  Stay updated with our latest articles and news
                </p>
              </div>
              <Switch
                checked={notificationPrefs.blogPosts}
                onCheckedChange={() => handleToggleNotification("blogPosts")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sign Out Option */}
      <Card>
        <CardHeader>
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>Sign out of your account on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You will need to sign in with your credentials again next time you visit.
          </p>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
      
      {/* Delete Account */}
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, all your data will be permanently removed.
            This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
