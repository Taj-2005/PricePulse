'use client';
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus("Tracking...");
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();  // CRASHES if res isn't valid JSON

      if (!res.ok) throw new Error(data?.error || "Tracking failed");

      setStatus(`Tracked: ${data.title} @ ${data.price}`);
    } catch (err: any) {
      console.error("Tracking error:", err.message);
      setStatus(`Error: ${err.message}`);
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
