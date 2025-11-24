"use client";

import React, { useState, useEffect } from "react";
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
  Filler,
} from "chart.js";
import { jwtDecode } from "jwt-decode";
import { Loader2, ExternalLink, TrendingDown, TrendingUp } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TokenPayload {
  email?: string;
}

type TimeFilter = "24h" | "7d" | "30d" | "all";

interface TrackingFormProps {
  defaultEmail?: string;
}

const TrackingForm = ({ defaultEmail }: TrackingFormProps) => {
  const pathname = usePathname();
  const [url, setUrl] = useState("");
  const [userEmail, setUserEmail] = useState(defaultEmail || "");
  const [targetPrice, setTargetPrice] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState<{
    id?: string;
    title: string;
    price: string;
    priceNumber?: number;
    imageUrl?: string;
    url?: string;
  } | null>(null);
  const [history, setHistory] = useState<{ price: number; timestamp: string }[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setUserEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const getEmailFromToken = (): string | null => {
      return null;
  };

  const fetchHistory = async (productUrl: string, filter: TimeFilter = "all") => {
    try {
      const historyRes = await fetch(
        `/api/history?url=${encodeURIComponent(productUrl)}&filter=${filter}`
      );
      if (!historyRes.ok) throw new Error("Failed to fetch price history");
      const historyData = await historyRes.json();
      setHistory(
        historyData.map((entry: any) => ({
          price: typeof entry.price === "number" ? entry.price : parseFloat(entry.price?.toString().replace(/[^0-9.]/g, "") || "0"),
          timestamp: entry.timestamp,
        }))
      );
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Tracking...");
    setLoading(true);
    setProduct(null);
    setHistory([]);

    try {
      let emailToSend = userEmail.trim();
      if (!emailToSend && defaultEmail) {
        emailToSend = defaultEmail;
      }

      const body: any = { url };
      if (emailToSend) body.userEmail = emailToSend;
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

      setProduct({
        id: data.id,
        title: data.title,
        price: data.price,
        priceNumber: data.priceNumber,
        imageUrl: data.imageUrl,
        url: data.url || url,
      });
      setStatus(`Tracked: ${data.title} @ ${data.price}`);
      toast.success("Product tracked successfully!");

      await fetchHistory(data.url || url, timeFilter);
    } catch (err: any) {
      console.error("Frontend error:", err.message);
      let friendlyMessage = getFriendlyErrorMessage(500);

      if (err.status === 502 || err.message.includes("Failed to scrape")) {
        friendlyMessage = getFriendlyErrorMessage(502);
      } else if (
        err.message.includes("Product not found") ||
        err.message.includes("404")
      ) {
        friendlyMessage = getFriendlyErrorMessage(404);
      } else if (
        err.message.includes("Too many requests") ||
        err.message.includes("429")
      ) {
        friendlyMessage = getFriendlyErrorMessage(429);
      } else if (err.message.includes("Invalid URL")) {
        friendlyMessage = getFriendlyErrorMessage(400);
      }

      toast.error(friendlyMessage);
      setStatus(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product?.url && timeFilter) {
      fetchHistory(product.url, timeFilter);
    }
  }, [timeFilter, product?.url]);

  const chartData = {
    labels: (history ?? []).map((entry) =>
      new Date(entry.timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    ),
    datasets: [
      {
        label: "Price (₹)",
        data: (history ?? []).map((entry) => entry.price),
        fill: true,
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        pointRadius: history.length > 20 ? 0 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(37, 99, 235)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#374151", font: { size: 12 } },
      },
      title: {
        display: true,
        text: "Price History Over Time",
        color: "#111827",
        font: { size: 16, weight: "bold" as const },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#374151" },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
      },
      y: {
        ticks: { color: "#374151" },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        beginAtZero: false,
      },
    },
  };

  const priceChange =
    history.length >= 2
      ? history[history.length - 1].price - history[0].price
      : 0;
  const priceChangePercent =
    history.length >= 2 && history[0].price > 0
      ? ((priceChange / history[0].price) * 100).toFixed(2)
      : "0";

  return (
    <>
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
        {pathname !== "/dashboard" && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-gray-900 font-archivo">
              Welcome to PricePulse
          </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Track your favorite products and get notified when the price drops!
            Just paste an Amazon product link, and optionally enter your email
            and target price to receive instant alerts.
          </p>
        </div>
        )}
        <div className="max-w-4xl mx-auto space-y-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white border border-gray-200 shadow-lg rounded-2xl p-6 sm:p-8"
            noValidate
          >
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Amazon Product URL <span className="text-red-500">*</span>
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.in/your-product-url"
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all input-field"
                required
                autoComplete="off"
                disabled={loading}
                aria-label="Amazon product URL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Your Email{" "}
                  <span className="text-gray-500 text-xs font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all input-field"
                  autoComplete="email"
                  disabled={loading}
                  aria-label="Your email address (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="targetPrice"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Target Price (₹){" "}
                  <span className="text-gray-500 text-xs font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="targetPrice"
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Enter target price"
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all input-field"
                  min={1}
                  step="0.01"
                  disabled={loading}
                  aria-label="Target price in rupees (optional)"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!url || loading}
              className={`w-full rounded-lg py-3.5 font-semibold text-white tracking-wide transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/50 ${
                url && !loading
                  ? "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              aria-label="Track product price"
            >
              {loading ? (
                <div className="flex flex-row justify-center items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Tracking...</span>
                </div>
              ) : (
                "Track Product"
              )}
            </button>
          </form>

          {product && (
            <section className="mt-6 p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex flex-col md:flex-row gap-6">
                {product.imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full md:w-56 h-56 object-contain rounded-xl bg-gray-50 border border-gray-200"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {product.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <p className="text-3xl sm:text-4xl font-extrabold text-green-600">
                      ₹{typeof product.priceNumber === 'number' ? product.priceNumber.toLocaleString('en-IN') : product.price}
                    </p>
                    {history.length >= 2 && (
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                          priceChange >= 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                        }`}
                        role="status"
                        aria-label={`Price ${priceChange >= 0 ? 'increased' : 'decreased'} by ${priceChangePercent}%`}
                      >
                        {priceChange >= 0 ? (
                          <TrendingUp className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <TrendingDown className="w-4 h-4" aria-hidden="true" />
                        )}
                        <span className="text-sm font-semibold">
                          {priceChange >= 0 ? "+" : ""}
                          {priceChangePercent}%
                        </span>
                      </div>
                    )}
                  </div>
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      View on Amazon <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-lg">
              <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
                {(["24h", "7d", "30d", "all"] as TimeFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      timeFilter === filter
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    aria-label={`Filter price history to ${filter === "all" ? "all time" : filter}`}
                    aria-pressed={timeFilter === filter}
                  >
                    {filter === "all" ? "All Time" : filter.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="h-64 sm:h-80 md:h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default TrackingForm;
