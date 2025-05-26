'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    toast.success("Logged in successfully!");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white flex flex-row justify-center items-center">
        <main className="p-6 border rounded-lg shadow-xl text-black bg-white">
            <h1 className="text-2xl font-bold mb-6">Login</h1>
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
                Login
                </button>
            </form>
            <p className="mt-4 text-center">
                Don't have an account?{" "}
                <a href="/register" className="text-blue-600 underline">
                Register
                </a>
            </p>
        </main>
    </div>
  );
}