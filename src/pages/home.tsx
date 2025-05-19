// pages/home.tsx
import { Link } from "react-router-dom"

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-[#5e60ce] flex flex-col">
            <header className="px-6 py-4 border-0 shadow-sm flex justify-between items-center text-white bg-[#5e60ce]">
                <div className="flex items-center space-x-2 ml-7">
                    <img src="/favicon.png" alt="RSVPE Logo" className="w-10 h-10" />
                    <h1 className="text-2xl font-bold text-white">Rsvpe</h1>
                </div>
                <nav className="space-x-4">
                    <Link
                        to="/login"
                        className="text-white hover:shadow-md px-6 py-2 bg-[#4e50be] shadow-md rounded-full hover:bg-white hover:text-[#5e60ce]"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="text-[#5e60ce] bg-white px-4 py-2 rounded-full hover:bg-[#4e50be] shadow-md hover:text-white"
                    >
                        Get Started
                    </Link>
                </nav>
            </header>


            <main className="flex-grow flex flex-col md:flex-row items-center justify-between px-6 py-4 max-w-6xl mx-auto">
                <div className="max-w-xl space-y-6">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#5e60ce]">Plan. Invite. Manage.</h2>
                    <p className="text-lg text-gray-700">
                        RSVPE helps you seamlessly manage your events — from creating invitations to tracking RSVPs.
                        Whether it's a wedding, party, or corporate event, we've got you covered.
                    </p>
                    <div className="space-x-4 mt-8">
                        <Link to="/register" className="bg-[#5e60ce] text-white px-6 py-3 rounded-full hover:bg-[#4e50be]">Create Event</Link>

                    </div>
                </div>
                <div className="flex justify-center md:mt-0">
                    <img
                        src="/World.svg"
                        alt="Event management"
                        className="w-[32rem] max-w-full"
                    />
                </div>

            </main>

            <footer className="text-center text-sm text-gray-500 py-4">
                &copy; {new Date().getFullYear()} RSVPE. All rights reserved.
            </footer>
        </div>
    )
}
