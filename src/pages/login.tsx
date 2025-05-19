"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "../contexts/auth-context"
import { Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(location.state?.message || null)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  // Set a timeout to show a message if loading takes too long
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (loading) {
      timeoutId = setTimeout(() => {
        setLoadingTimeout(true)
      }, 5000) // Show message after 5 seconds
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [loading])

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard")
    }
  }, [user, loading, navigate])

  const onSubmit = async (data: LoginFormValues) => {
    // Prevent multiple submissions
    if (isLoading) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { error } = await signIn(data.email, data.password)

      if (error) {
        console.error("Login error:", error)
        setError(error.message || "Failed to sign in. Please check your credentials.")
        setIsLoading(false)
      }
      // No need to navigate here - the auth state change will trigger the useEffect
    } catch (err) {
      console.error("Unexpected login error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e60ce]" />
        <p className="mt-4 text-sm text-muted-foreground">
          {loadingTimeout ? "Still loading... This is taking longer than expected." : "Loading..."}
        </p>
        {loadingTimeout && (
          <div className="mt-4 max-w-md text-center text-sm text-muted-foreground">
            <p>If this continues, try refreshing the page or checking your connection.</p>
            <Button variant="link" className="mt-2 text-[#5e60ce]" onClick={() => window.location.reload()}>
              Refresh the page
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Don't render the login form if already logged in
  if (user) {
    return null // Will be redirected by useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-gray-500 px-4">
      <Card className="w-full max-w-md border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-[#5e60ce]">Sign in</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {successMessage && (
              <Alert className="border-0 bg-[#d9f6ee]">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="border-0 bg-[#fde8e8]">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2 ">
              <Label htmlFor="email">Email</Label>
              <Input
                className="border-gray-200"
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2 border-gray-500">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                disabled={isLoading}
                className="border-gray-200"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-[#5e60ce] hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full bg-[#5e60ce] text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#5e69ce]">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
