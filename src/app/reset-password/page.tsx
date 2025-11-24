"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid or missing reset token");
    }
  }, [token, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");

    if (password !== confirm)
      return toast.error("Passwords do not match");

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset! Please sign in.");
        router.push("/login");
      } else {
        toast.error(data?.error || "Reset failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 py-16">

      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-8 relative">

        {/* HEADER */}
        <div className="text-center mb-6">
          <Image
            src="/pricepulse4.png"
            alt="PricePulse Logo"
            width={150}
            height={150}
            className="mx-auto mb-3"
          />
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-1">Choose a strong new password</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NEW PASSWORD */}
          <div className="relative">
            <label className="block font-semibold text-gray-700 mb-2">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPass ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white 
                       font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save New Password"
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
