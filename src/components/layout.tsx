import { Outlet } from "react-router-dom"

import Navbar from "./navbar"

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#fbfbfb]">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        <Outlet />
        
      </main>
    </div>
  )
}
