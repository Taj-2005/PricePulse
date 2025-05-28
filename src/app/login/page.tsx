'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logging, setLogging] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    setLogging(true);
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Login failed");
      setLogging(false);
      return;
    }

    localStorage.setItem("token", data.token);
    toast.success("Logged in successfully!");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white flex flex-row justify-center items-center gap-10">
          <div className="hidden lg:flex items-center gap-4">
            <Image
              src="/login.svg"
              width={500}
              height={500}
              alt="PricePulse Logo"
              className="rounded-lg"
            />
        </div>
        <main className="p-10 border rounded-lg shadow-xl text-black bg-white mx-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
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
                <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                {!logging ? "Login" : <div className="flex flex-row items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-400 text-center" /></div>}
                </button>
            </form>
            <p className="mt-4 text-center">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 underline">
                Sign Up
                </a>
            </p>
        </main>
    </div>
  );
}