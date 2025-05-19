"use client"

import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const [loadingTimeout, setLoadingTimeout] = useState(false)

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

  // If still loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e60ce]" />
        <p className="mt-4 text-sm text-muted-foreground">
          {loadingTimeout ? "Still loading... This is taking longer than expected." : "Loading..."}
        </p>
        {loadingTimeout && (
          <div className="mt-4 max-w-md text-center text-sm text-muted-foreground">
            <p>If this continues, try refreshing the page or checking your connection.</p>
          </div>
        )}
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If authenticated, render the protected content
  return <Outlet />
}
