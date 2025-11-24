'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import LoginBtn from "@/app/components/LoginBtn";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logging, setLogging] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  async function handleSubmit(e: React.FormEvent) {
    setLogging(true);
    e.preventDefault();

    try {
      console.log("Attempting login for:", email);
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important: include cookies in request
      });

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        const text = await res.text();
        console.error("Response text:", text);
        throw new Error("Invalid response from server");
      }
      
      console.log("Login response:", { status: res.status, ok: res.ok, data });

      if (!res.ok) {
        console.error("Login failed:", data.error);
        toast.error(data.error || "Login failed");
        setLogging(false);
        return;
      }

      // Cookie is set automatically by server
      console.log("Login successful, cookie should be set");
      
      // Check if cookie is in response headers
      const setCookieHeader = res.headers.get("set-cookie");
      console.log("Set-Cookie header:", setCookieHeader);
      
      toast.success("Logged in successfully!");
      
      // Wait a bit longer to ensure cookie is fully set
      await new Promise(resolve => setTimeout(resolve, 200));
      setLogging(false);
      router.push(redirect || "/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred. Please try again.");
      setLogging(false);
    }
  }

  return (
    <>
      <Navbar AuthButton={<LoginBtn />} />
      <div className="max-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Section */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <Image
                src="/login.svg"
                width={600}
                height={600}
                alt="Login illustration"
                className="rounded-2xl"
                priority
                quality={90}
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-200">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-archivo">
                  Welcome Back
                </h1>
                <p className="text-gray-600">
                  Sign in to manage your tracked products
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                  <Mail 
                    className="absolute left-3 top-[50%] -translate-y-[50%] size-5 text-gray-400 pointer-events-none" 
                    aria-hidden="true" 
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    aria-label="Email address"
                  />
                </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none"
                      aria-hidden="true"
                    />

                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      aria-label="Password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={logging}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed btn-primary"
                  aria-label="Sign in to your account"
                >
                  {logging ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

