"use client";

import { SignUp, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

// Helper component to handle the redirect
function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-gray-400 mt-4">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SignedIn>
        <RedirectToDashboard />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <SignUp 
            routing="hash"
            afterSignUpUrl="/dashboard" 
            signInUrl="/sign-in"
          />
        </div>
      </SignedOut>
    </>
  );
} 