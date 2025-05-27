"use client";

import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import getFriendlyErrorMessage from "@/lib/errors";
import { usePathname } from "next/navigation";

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
import {jwtDecode} from "jwt-decode";
import { Loader2 } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TokenPayload {
  email?: string;
}

const TrackingForm = () => {
  const pathname = usePathname();
  const [url, setUrl] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState<{ title: string; price: string } | null>(null);
  const [history, setHistory] = useState<{ price: string; timestamp: string }[]>([]);
  const [hideOptionalFields, setHideOptionalFields] = useState(false);

  const getEmailFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("token"); // change this if you store token elsewhere
      if (!token) return null;
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.email ?? null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Tracking...");
    setProduct(null);
    setHistory([]);

    try {
      // Use user typed email if present, else fallback to token email, else null
      let emailToSend = userEmail.trim();
      if (!emailToSend) {
        emailToSend = getEmailFromToken() || "";
      }

      const body: any = { url };
      body.userEmail = emailToSend !== "" ? emailToSend : null; // explicitly send null if no email
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
      toast.success("Tracked product");

      const historyRes = await fetch(`/api/history?url=${encodeURIComponent(url)}`);
      if (!historyRes.ok) throw new Error("Failed to fetch price history");

      const historyData = await historyRes.json();
      setHistory(historyData);
      setHideOptionalFields(true);
    } catch (err: any) {
      console.error("Frontend error:", err.message);
      let friendlyMessage = getFriendlyErrorMessage(500);

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
    labels: (history ?? []).map((entry) => new Date(entry.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Price (₹)",
        data: (history ?? []).map((entry) => {
          const priceStr = entry?.price ?? "";
          return parseFloat(priceStr.toString().replace(/[^0-9.-]+/g, "")) || 0;
        }),
        fill: false,
        borderColor: "#2563EB",
        backgroundColor: "#2563EB",
        tension: 0.3,
        pointRadius: 0,
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
    <>
      <main className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h2
            className={`${
              pathname === "/dashboard" ? "text-2xl animate-bounce" : "text-5xl"
            } font-bold mb-2 text-black font-archivo`}
          >
            {!(pathname === "/dashboard") ? "Welcome to" : ""} PricePulse
          </h2>
          <p className={`text-gray-700 ${pathname === "/dashboard" ? "text-sm" : "text-1xl"} max-w-md mx-auto`}>
            Track your favorite products and get notified when the price drops! Just paste an Amazon product link,
            and optionally enter your email and target price to receive instant alerts.
          </p>
          <p className={`text-gray-700 ${pathname === "/dashboard" ? "text-sm" : "text-1xl"} mt-2`}>
            <strong>To get price drop alerts to your email</strong>, enter your email and the price you’re waiting
            for.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-10">
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
                    Your Email{" "}
                    <span className="text-red-500 text-sm">(check spam folder)</span>
                    <span className="p-2 font-medium text-gray-400 text-sm">(optional)</span>
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
                    <span className="p-2 font-medium text-gray-400 text-sm">(optional)</span>
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
                ((url && !userEmail && !targetPrice) || (url && userEmail && targetPrice)) ? "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]" : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Track Price
            </button>
          </form>

          {product && (
            <>
              <div className="text-center mt-4 text-gray-800">
                <h3 className="text-xl font-semibold mb-1">{product.title}</h3>
                <p className="text-lg font-bold">{product.price}</p>
              </div>
              {history && history.length > 0 && (
                <div className="mt-6 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl p-6 shadow-xl">
                  <Line options={chartOptions} data={chartData} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default TrackingForm;
