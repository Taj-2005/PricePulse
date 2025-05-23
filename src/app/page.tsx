'use client';

import { useState } from "react";
import toast from "react-hot-toast";
import getFriendlyErrorMessage from "@/lib/errors";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [url, setUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState<{ title: string; price: string } | null>(null);
  const [history, setHistory] = useState<{ price: string; timestamp: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Tracking...");
    setProduct(null);
    setHistory([]);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, userEmail, targetPrice: Number(targetPrice) }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) throw new Error(data?.error || "Unknown server error");

      setProduct({ title: data.title, price: data.price });
      setStatus(`Tracked: ${data.title} @ ${data.price}`);
      toast.success(`Tracked data`);

      const historyRes = await fetch(`/api/history?url=${encodeURIComponent(url)}`);
      if (!historyRes.ok) throw new Error("Failed to fetch price history");

      const historyData = await historyRes.json();
      setHistory(historyData);
    } catch (err: any) {
      console.error("Frontend error:", err.message);
      let friendlyMessage = getFriendlyErrorMessage(500);

      if (err.message.includes("Product not found") || err.message.includes("404")) {
        friendlyMessage = getFriendlyErrorMessage(404);
      } else if (err.message.includes("Too many requests") || err.message.includes("429")) {
        friendlyMessage = getFriendlyErrorMessage(429);
      } else if (err.message.includes("Invalid URL")) {
        friendlyMessage = getFriendlyErrorMessage(400);
      }

      toast.error(friendlyMessage);
      setStatus(friendlyMessage);
    }
  };

  const chartData = {
    labels: history.map((entry) => new Date(entry.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Price (₹)",
        data: history.map((entry) =>
          parseFloat(entry.price.replace(/[^0-9.-]+/g, ""))
        ),
        fill: false,
        borderColor: "#2563EB",
        backgroundColor: "#2563EB",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const, labels: { color: "#374151" } },
      title: { display: true, text: "Price History Over Time", color: "#111827" },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: {
        ticks: { color: "#6B7280" },
        grid: { color: "#E5E7EB" },
      },
      y: {
        ticks: { color: "#6B7280" },
        grid: { color: "#E5E7EB" },
      },
    },
  };

  return (
    <main className="p-8 max-w-3xl mx-auto min-h-screen bg-white">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900 text-center select-none">PricePulse</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <label htmlFor="url" className="block text-gray-700 font-medium mb-2">
          Amazon Product URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.amazon.in/your-product-url"
          className="w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
          autoComplete="off"
        />

        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
          Your Email (to receive alerts)
        </label>
        <input
          id="email"
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          required
          autoComplete="email"
        />

        <label htmlFor="targetPrice" className="block text-gray-700 font-medium mb-2">
          Target Price (₹)
        </label>
        <input
          id="targetPrice"
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="Enter price to get alert"
          className="w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          min={1}
          required
        />

        <button
          type="submit"
          disabled={!url || !userEmail || !targetPrice}
          className={`w-full rounded-md py-3 font-semibold text-white transition
            ${url && userEmail && targetPrice ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
        >
          Track Price
        </button>
      </form>

      {status && (
        <p
          className={`mt-6 text-center font-medium ${
            status.toLowerCase().includes("error") || status.toLowerCase().includes("fail")
              ? "text-red-600"
              : "text-green-600"
          } select-text`}
        >
          {status}
        </p>
      )}

      {product && (
        <section
          aria-label="Tracked product details"
          className="mt-10 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2 truncate">{product.title}</h2>
          <p className="text-2xl font-extrabold text-green-700">₹ {product.price}</p>
        </section>
      )}

      {history.length > 0 && (
        <section
          aria-label="Price history chart"
          className="mt-12 p-6 bg-white rounded-lg shadow-lg border border-gray-100"
        >
          <Line data={chartData} options={chartOptions} />
        </section>
      )}
    </main>
  );
}
