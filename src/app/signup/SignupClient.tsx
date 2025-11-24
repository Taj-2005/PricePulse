'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import LoginBtn from "@/app/components/LoginBtn";

export default function SignupClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [logging, setLogging] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    setLogging(true);
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLogging(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLogging(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        setLogging(false);
        return;
      }

      toast.success("Registered successfully! Please login.");
      router.push("/login");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setLogging(false);
    }
  }

  const passwordMatch = password && confirmPassword && password === confirmPassword;
  const passwordLength = password.length >= 6;

  return (
    <>
      <Navbar AuthButton={<LoginBtn />} />
      <div className="bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 max-h-screen">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Section */}
          <div className="hidden lg:flex items-center justify-center order-2">
            <div className="relative w-full max-w-lg">
              <Image
                src="/signup.svg"
                width={600}
                height={600}
                alt="Sign up illustration"
                className="rounded-2xl"
                priority
                quality={90}
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="w-full max-w-md mx-auto order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-200">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-archivo">
                  Create Account
                </h1>
                <p className="text-gray-600">
                  Start tracking prices and saving money today
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none"
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
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                transition-all"
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
                      placeholder="Create a password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                transition-all"
                      aria-label="Password"
                    />
                  </div>
                  {password && (
                    <div className="mt-2 text-xs text-gray-600">
                      {passwordLength ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Minimum length met
                        </span>
                      ) : (
                        <span>Password must be at least 6 characters</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none"
                      aria-hidden="true"
                    />

                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                transition-all"
                      aria-label="Confirm password"
                    />
                  </div>
                  {confirmPassword && (
                    <div className="mt-2 text-xs">
                      {passwordMatch ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Passwords match
                        </span>
                      ) : (
                        <span className="text-red-600">Passwords do not match</span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={logging || !passwordMatch || !passwordLength}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed btn-primary"
                  aria-label="Create your account"
                >
                  {logging ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

