"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("If an account exists, a reset email has been sent.");
        router.push("/login");
      } else {
        toast.error(data?.error || "Something went wrong.");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-20">

      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-10">

        {/* HEADER */}
        <div className="text-center mb-6">
          <Image
            src="/pricepulse4.png"
            width={150}
            height={150}
            alt="PricePulse Logo"
            className="mx-auto mb-3"
          />
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-1">
            Enter your email to receive reset instructions.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL FIELD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

              <input
                type="email"
                required
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white 
                       font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl 
                       transition-all duration-200 focus:ring-4 focus:ring-blue-500/40 
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Reset Email
                <ArrowRight className="size-5" />
              </>
            )}
          </button>

        </form>

        {/* BACK TO LOGIN */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 cursor-pointer hover:text-blue-700 font-semibold underline underline-offset-2"
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}
