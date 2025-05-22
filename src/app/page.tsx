'use client';
import { useState } from "react";
import toast from "react-hot-toast";
import getFriendlyErrorMessage from "@/lib/errors";

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Tracking...");

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) throw new Error(data?.error || "Unknown server error");
      toast.success(`Tracked data`);
      setStatus(`Tracked: ${data.title} @ ${data.price}`);
    } catch (err: any) {
        console.error("Frontend error:", err.message);

        // Extract status code from error message (fallback to 500)
        const match = err.message.match(/status code (\d+)/);
        const code = match ? parseInt(match[1], 10) : 500;

        // Map error messages to friendly messages manually for common cases
        let friendlyMessage = "";

        if (code === 500) {
          // Inspect error message to customize for your known backend errors
          if (err.message.includes("Product not found") || err.message.includes("404")) {
            friendlyMessage = getFriendlyErrorMessage(404);
          } else if (err.message.includes("Too many requests") || err.message.includes("429")) {
            friendlyMessage = getFriendlyErrorMessage(429);
          } else if (err.message.includes("Invalid URL")) {
            friendlyMessage = getFriendlyErrorMessage(400);
          } else {
            friendlyMessage = getFriendlyErrorMessage(500);
          }
        } else {
          // Use the code directly if it's not 500
          friendlyMessage = getFriendlyErrorMessage(code);
        }

        toast.error(friendlyMessage);
        setStatus(`${friendlyMessage}`);
      }
  };



  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">PricePulse</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Amazon Product URL"
          className="w-full border p-2 rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Track Price</button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </main>
  );
}
