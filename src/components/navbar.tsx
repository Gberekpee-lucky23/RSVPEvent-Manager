"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "../contexts/auth-context"
import { CalendarPlus, LogOut, Loader2 } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const { signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    try {
      await signOut()
      // Auth context will handle redirect/logout
    } catch (err) {
      console.error("Failed to sign out:", err)
      setIsSigningOut(false)
    }
  }

  return (
    <header className="border-0  bg-[#5e60ce] bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="text-xl font-bold text-white">
          EventRSVP
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="bg-white text-[#5e60ce]">
            <Link to="/create-event">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
          <Button
            
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-white shadow-md cursor-pointer"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
