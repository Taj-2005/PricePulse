"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    async function verify() {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/signin"), 3000);
      } else {
        setStatus("error");
      }
    }
    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white relative overflow-hidden px-4">

      {/* Blue glow background */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-20 right-10 w-[28rem] h-[28rem] bg-blue-200/30 blur-3xl rounded-full"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative bg-white/70 backdrop-blur-lg max-w-md w-full shadow-xl rounded-2xl border border-blue-200 p-10 text-center"
      >
        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6 shadow">
              <Loader2 className="text-blue-600 animate-spin" size={45} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email…</h1>
            <p className="text-gray-600">Please wait while we confirm your account.</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 shadow">
              <CheckCircle className="text-green-600" size={45} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">Redirecting you to login…</p>

            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-left shadow-inner">
              <p className="text-green-700 text-sm">
                Your PricePulse account is now activated. You can now track price drops instantly!
              </p>
            </div>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6 shadow">
              <XCircle className="text-red-600" size={45} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-6">
              The verification link may be invalid or expired.
            </p>

            <button
              onClick={() => router.push("/signin")}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              Go to Sign In
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="mt-3 w-full py-3 rounded-xl bg-white border border-blue-300 text-blue-700 font-semibold hover:bg-blue-50 transition"
            >
              Create New Account
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
