"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "./contexts/auth-context"
import Login from "./pages/login"
import Register from "./pages/register"
import Dashboard from "./pages/dashboard"
import CreateEvent from "./pages/create-event"
import EventDetails from "./pages/event-details"
import RsvpPage from "./pages/rsvp-page"
import ProtectedRoute from "./components/protected-route"
import Layout from "./components/layout"
// import AuthDebugger from "./components/auth-debugger"
// import DbDebugger from "./components/db-debugger"
import { useEffect, useState } from "react"
import { checkSupabaseConnection } from "./lib/supabase"
import { Loader2 } from "lucide-react"
import ForgotPassword from "./pages/ForgetPassword"

function App() {
  const [connectionChecked, setConnectionChecked] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  // const [showDebugger, setShowDebugger] = useState(false)

  // useEffect(() => {
  //   // Enable debugger with Ctrl+Shift+D
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.ctrlKey && e.shiftKey && e.key === "D") {
  //       setShowDebugger((prev) => !prev)
  //     }
  //   }

  //   window.addEventListener("keydown", handleKeyDown)
  //   return () => window.removeEventListener("keydown", handleKeyDown)
  // }, [])

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection()
        if (!isConnected) {
          setConnectionError(true)
        }
      } catch (error) {
        console.error("Connection check error:", error)
        setConnectionError(true)
      } finally {
        setConnectionChecked(true)
      }
    }

    checkConnection()
  }, [])

  if (!connectionChecked) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e60ce]" />
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (connectionError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-4 text-xl font-semibold text-red-700">Connection Error</h2>
          <p className="mb-4 text-red-600">
            Unable to connect to the database. Please check your internet connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-[#5e60ce] px-4 py-2 text-white hover:bg-[#4e50be]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rsvp/:eventId" element={<RsvpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/events/:eventId" element={<EventDetails />} />
            </Route>
          </Route>

          {/* Redirect routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
        {/* {showDebugger && <AuthDebugger />}
        <DbDebugger /> */}
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
