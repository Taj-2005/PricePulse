'use client';

import { useState } from "react";
import toast from "react-hot-toast";
import getFriendlyErrorMessage from "@/lib/errors";
import Image from "next/image";

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
  const [hideOptionalFields, setHideOptionalFields] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Tracking...");
    setProduct(null);
    setHistory([]);

    try {
      const body: any = { url };
      if (userEmail) body.userEmail = userEmail;
      if (targetPrice) body.targetPrice = Number(targetPrice);

      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) throw new Error(data?.error || "Unknown server error");

      if (!data.title || !data.price) throw new Error("Incomplete product data");

      setProduct({ title: data.title, price: data.price });
      setStatus(`Tracked: ${data.title} @ ${data.price}`);
      toast.success(`Tracked product`);

      const historyRes = await fetch(`/api/history?url=${encodeURIComponent(url)}`);
      if (!historyRes.ok) throw new Error("Failed to fetch price history");

      const historyData = await historyRes.json();
      setHistory(historyData);
      setHideOptionalFields(true);
    } catch (err: any) {
        console.error("Frontend error:", err.message);
        let friendlyMessage = getFriendlyErrorMessage(500); // default

        if (err.status === 502 || err.message.includes("Failed to scrape")) {
          friendlyMessage = getFriendlyErrorMessage(502);
        } else if (err.message.includes("Product not found") || err.message.includes("404")) {
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
    labels: (history ?? []).map(entry => new Date(entry.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Price (₹)",
        data: (history ?? []).map(entry => {
          const priceStr = entry?.price ?? "";
          return parseFloat(priceStr.toString().replace(/[^0-9.-]+/g, "")) || 0;
        }),
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
  <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Hero */}
      <div className="flex items-center gap-4 justify-center">
        <Image
          src="/pricepulse.png"
          width={60}
          height={60}
          alt="PricePulse Logo"
          className="rounded-xl shadow-lg"
        />
        <h1 className=" text-4xl font-bold text-gray-900 tracking-tight">PricePulse</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white/60 backdrop-blur-sm border border-blue-100 shadow-xl rounded-xl p-6 transition-all duration-300"
      >
        <div>
          <label htmlFor="url" className="block text-gray-800 font-semibold mb-1">
            Amazon Product URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.amazon.in/your-product-url"
            className="w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-900 focus:ring-2 focus:ring-blue-500 transition"
            required
            autoComplete="off"
            disabled={status === "Tracking..."}
          />
        </div>

        {!hideOptionalFields && (
          <>
            <div>
              <label htmlFor="email" className="block text-gray-800 font-semibold mb-1">
                Your Email <span className="text-red-500 text-sm">(check spam folder)</span>
              </label>
              <input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-900 focus:ring-2 focus:ring-blue-500 transition"
                autoComplete="email"
                disabled={status === "Tracking..."}
              />
            </div>

            <div>
              <label htmlFor="targetPrice" className="block text-gray-800 font-semibold mb-1">
                Target Price
              </label>
              <input
                id="targetPrice"
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter your target price (₹)"
                className="w-full rounded-lg border px-4 py-3 placeholder-gray-400 text-gray-900 focus:ring-2 focus:ring-blue-500 transition"
                min={1}
                disabled={status === "Tracking..."}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={!url}
          className={`w-full rounded-lg py-3 font-bold text-white tracking-wide transition-transform duration-300 ${
            (url && (userEmail || !userEmail)) ? "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]" : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Track Price 🚀
        </button>
      </form>

      {/* Status Message */}
      {status && (
        <p
          className={`text-center font-semibold transition-all ${
            status.toLowerCase().includes("error") || status.toLowerCase().includes("fail")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {status}
        </p>
      )}

      {/* Product Display */}
      {product && (
        <section className="mt-6 p-6 bg-gradient-to-r from-white via-blue-50 to-white rounded-lg border shadow-md flex flex-col items-center text-center">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{product.title}</h2>
          <p className="text-3xl font-extrabold text-green-700 mt-2">₹ {product.price}</p>
        </section>
      )}

      {/* Chart Display */}
      {history.length > 0 && (
        <section className="mt-10 bg-white p-6 rounded-xl border border-gray-100 shadow-xl">
          <Line data={chartData} options={chartOptions} />
        </section>
      )}
    </div>
  </main>
);
}
