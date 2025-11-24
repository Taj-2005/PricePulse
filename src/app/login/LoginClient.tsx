"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import LoginBtn from "@/app/components/LoginBtn";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (expired) {
      toast.error("Session expired. Please log in again.");
    }
  }, [expired]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logging, setLogging] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLogging(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.needsVerification) {
        toast.error("Please verify your email to continue.");
        router.push(`/verification-pending?email=${encodeURIComponent(email)}`);
        setLogging(false);
        return;
      }

      if (!res.ok) {
        const errorMessage =
          data?.error ||
          (res.status === 401 ? "Invalid credentials" : null) ||
          "Login failed";

        toast.error(errorMessage);
        setLogging(false);
        return;
      }

      toast.success("Logged in successfully!");

      await new Promise((r) => setTimeout(r, 300));
      window.location.reload();
    } catch {
      toast.error("Something went wrong.");
    }

    setLogging(false);
  }

  return (
    <>
      <Navbar AuthButton={<LoginBtn />} />

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* LEFT IMAGE */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-lg drop-shadow-2xl">
              <Image
                src="/login.svg"
                width={620}
                height={620}
                alt="Login Illustration"
                className="rounded-2xl"
                priority
              />
            </div>
          </div>

          {/* RIGHT LOGIN FORM */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-200">

              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-archivo">
                  Welcome Back
                </h1>
                <p className="text-gray-600 mt-1">
                  Sign in to manage and track your products
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* EMAIL INPUT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />

                    {/* SHOW / HIDE PASSWORD BUTTON */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700
                                transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>

                  {/* FORGOT PASSWORD */}
                  <div className="text-right mt-2">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium underline-offset-2 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>


                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={logging}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white 
                             font-semibold rounded-lg hover:bg-blue-700 shadow-lg 
                             hover:shadow-xl transition-all duration-200 
                             focus:ring-4 focus:ring-blue-500/40 disabled:opacity-60"
                >
                  {logging ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="size-5" />
                    </>
                  )}
                </button>
              </form>

              {/* SIGN UP */}
              <p className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2"
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
