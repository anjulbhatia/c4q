// app/page.tsx
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-white text-black flex flex-col overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Image
          src="/chart-background.jpg"
          alt="Gradient Chart Background"
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="text-xl font-semibold tracking-tight">C4Q</div>
        <div className="flex gap-4 items-center">
          <Popover>
            <PopoverTrigger className="text-gray-600 hover:text-black text-sm">About</PopoverTrigger>
            <PopoverContent className="text-sm text-gray-700">
              <p className="mb-2 font-medium">What is C4Q?</p>
              <p className="mb-1">An AI-powered tool to create charts from queries.</p>
              <p className="text-xs text-gray-500">Built for students, analysts, and non-tech users.</p>
            </PopoverContent>
          </Popover>

          <Link href="/app">
            <Button variant="outline" className="text-sm rounded-lg px-4 py-2">
              Sign in
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Meet <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">ChartsFromQuery</span>,
          <br /> your AI-powered chart assistant
        </h1>
        <p className="text-gray-700 text-lg max-w-xl mb-8">
          Upload data, ask questions in plain English or SQL, and let AI generate beautiful, insightful charts for you.
        </p>
        <Link href="/app">
          <Button variant="default" className="text-md px-6 py-4 rounded-xl font-semibold shadow-sm bg-indigo-600 hover:bg-indigo-700">
            Continue as Guest
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center text-sm text-stone-500 pb-4">
        <p>
          Built for students, analysts & fast movers — the ones who can't wait for the IT guy 
        </p>
      </footer>
    </main>
  );
}
