'use client';

import { Navigation } from './navigation';
import { useApp } from '@/lib/context';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading } = useApp();

  // Show landing page if user is not logged in
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        {/* Gradient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 relative z-10">
          <div className="max-w-lg text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground tracking-tight">
              TravelCost <span className="gradient-primary bg-clip-text text-transparent">PK</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Smart travel expense calculator for Pakistan. Track costs, manage cars, and optimize fuel spending with real-time analytics.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/sign-up">
                <Button className="btn-gradient px-8 py-6 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button className="btn-gradient-secondary px-8 py-6 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="gradient-border py-6 text-center text-muted-foreground relative z-10">
          <p>TravelCost PK © {new Date().getFullYear()} - Smart travel expense tracking</p>
        </footer>
      </div>
    );
  }

  // Waiting for Clerk or DB context to load
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 md:ml-0 mb-24 md:mb-0">
        {children}
      </main>
    </div>
  );
}
