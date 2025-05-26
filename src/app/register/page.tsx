'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Registration failed");
      return;
    }

    toast.success("Registered successfully! Please login.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-white flex flex-row justify-center items-center">
        <main className="max-w-md mx-auto p-6 border rounded-lg shadow-lg text-black">
            <h1 className="text-2xl font-bold mb-6">Register</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
                />
                <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded"
                />
                <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                Register
                </button>
            </form>
            <p className="mt-4 text-center">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 underline">
                Login
                </a>
            </p>
        </main>
    </div>
  );
}
