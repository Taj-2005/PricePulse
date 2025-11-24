"use client";

// We're using custom JWT auth, not next-auth
// This wrapper is kept for compatibility but doesn't use next-auth
export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}