'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
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
      return;
    }

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
  }

  return (
    <div className="min-h-screen bg-white flex flex-row-reverse gap-10 justify-center items-center">
        <div className="items-center gap-4 hidden lg:flex">
          <Image
            src="/signup.svg"
            width={700}
            height={700}
            alt="PricePulse Logo"
            className="rounded-lg"
          />
        </div>
        <main className="m-5 p-10 border rounded-lg shadow-xl text-black bg-white max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
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
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                {!logging ? "Sign Up" : <div className="flex flex-row items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-400 text-center" /></div>}
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
