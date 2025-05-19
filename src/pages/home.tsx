// pages/home.tsx
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-4 border-b shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#5e60ce]">RSVP Events</h1>
        <nav className="space-x-4">
          <Link to="/login" className="text-[#5e60ce] hover:underline">Login</Link>
          <Link to="/register" className="text-white bg-[#5e60ce] px-4 py-2 rounded-md hover:bg-[#4e50be]">Get Started</Link>
        </nav>
      </header>

      <main className="flex-grow flex flex-col md:flex-row items-center justify-between px-6 py-12 max-w-6xl mx-auto">
        <div className="max-w-xl space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#5e60ce]">Plan. Invite. Manage.</h2>
          <p className="text-lg text-gray-700">
            EventEase helps you seamlessly manage your events — from creating invitations to tracking RSVPs. 
            Whether it's a wedding, party, or corporate event, we've got you covered.
          </p>
          <div className="space-x-4">
            <Link to="/register" className="bg-[#5e60ce] text-white px-6 py-3 rounded-md hover:bg-[#4e50be]">Create Event</Link>
            <Link to="/login" className="text-[#5e60ce] underline">Already have an account?</Link>
          </div>
        </div>
        <div className="mt-12 md:mt-0">
          <img
            src="https://illustrations.popsy.co/gray/event.svg"
            alt="Event management"
            className="w-full max-w-md"
          />
        </div>
      </main>

      <footer className="text-center text-sm text-gray-500 py-4">
        &copy; {new Date().getFullYear()} EventEase. All rights reserved.
      </footer>
    </div>
  )
}
