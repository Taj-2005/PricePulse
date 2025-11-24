"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiMail, FiRefreshCcw, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

export default function VerificationPending() {
  const params = useSearchParams();
  const email = params.get("email");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 12000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-16 relative">

      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-[28rem] h-[28rem] bg-blue-200/30 blur-3xl rounded-full"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white/70 backdrop-blur-lg max-w-md w-full shadow-xl rounded-2xl border border-blue-200 p-10 text-center"
      >
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 shadow">
            <FiMail className="text-blue-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">
            A verification link has been sent to  
            <span className="font-semibold text-blue-700"> {email}</span>.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left mb-6 shadow-inner">
          <Step title="Check your inbox" />
          <Step title="Click the verification link" />
          <Step title="Return automatically after verifying" />
        </div>

        <button
          onClick={async () => {
            await fetch("/api/auth/resend-verification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
          }}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
        >
          <FiRefreshCcw className="inline-block mr-2" /> Resend Email
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Didn’t receive it? Check spam folder.
        </p>
      </motion.div>
    </div>
  );
}

function Step({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <FiCheckCircle className="text-green-500" size={20} />
      <p className="text-gray-700 text-sm">{title}</p>
    </div>
  );
}
