"use client";

import { useEffect, useState } from "react";
import TrackingForm from "@/app/components/TrackingForm";
import TrackedList from "@/app/components/TrackedList";
import toast from "react-hot-toast";
import {PlusCircle } from "lucide-react";
import { Line } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Product {
  title: string;
  _id: string;
  url: string;
  currentPrice: number;
  userEmail: string;
}

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const [product, setProduct] = useState<{ title: string; price: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ price: string; timestamp: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tracked");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        const filtered = data.filter((product: Product) => product.userEmail === userEmail);
        setProducts(filtered);
        if (filtered.length === 0) setShowForm(true);
      } catch (err) {
        setError("Oops! Could not load your tracked products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userEmail]);

  const handleAddClick = () => {
    setHistory([]);
    setProduct(null);
    setShowForm(true);
  }
  const handleFormSubmit = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
    setShowForm(false);
  };


  const productFetch = async (url: string) => {
    const body: any = { url };
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
      toast.success("Tracked product");

      const historyRes = await fetch(`/api/history?url=${encodeURIComponent(url)}`);
      if (!historyRes.ok) throw new Error("Failed to fetch price history");

      const historyData = await historyRes.json();
      setHistory(historyData);
  }

    const chartData = {
    labels: (history ?? []).map((entry) => new Date(entry.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Price (₹)",
        data: (history ?? []).map((entry) => {
          const priceStr = entry?.price ?? "";
          return parseFloat(priceStr.toString().replace(/[^0-9.-]+/g, "")) || 0;
        }),
        fill: true,
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
    <div className="flex flex-col items-center min-h-screen w-full p-6 bg-gradient-to-br from-white via-blue-50 to-white text-gray-900">
      <div className="w-full max-w-5xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 tracking-tight flex justify-center items-center gap-2 animate-pulse font-archivo">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-xl">Track your favorite products and stay ahead of the best deals!</p>
        </div>

        {loading && (
          <p className="text-center text-gray-500 animate-pulse text-lg">Loading your tracked products...</p>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 font-semibold p-4 rounded-lg shadow text-center">
            {error}
          </div>
        )}

        {!loading && !showForm && products.length > 0 && (
          <div className="space-y-6">
            <div className="text-center text-gray-700 text-sm md:text-lg">
              Here are the products you’re currently tracking. Want to add more?
            </div>

            <TrackedList handleClick={productFetch} products={products} />

            <div className="flex justify-center">
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <PlusCircle className="w-5 h-5" />
                Add Another Product
              </button>
            </div>
          </div>
        )}

        {!loading && showForm && (
          <div className="bg-white p-6 rounded-xl shadow-xl w-full mx-auto">
            <p className="mb-4 text-center text-gray-700 font-medium">
              {products.length === 0
                ? "Start tracking your first product now!"
                : "Add a new product to your tracked list."}
            </p>
            <TrackingForm />
          </div>
        )}

        {!loading && !showForm && products.length === 0 && !error && (
          <div className="flex flex-col items-center mt-10 space-y-4">
            <img
              src="/empty-state.svg"
              alt="No tracked products"
              className="w-64 h-64 object-contain"
            />
            <p className="text-center text-gray-600 text-lg">
              You have no tracked products yet. Click below to start!
            </p>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <PlusCircle className="w-5 h-5" />
              Add Product
            </button>
          </div>
        )}
      </div>
      {product && (
        <div className="w-full max-w-3xl mx-auto border border-slate-200 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md p-6 transition-all duration-300 hover:shadow-3xl mt-30">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 truncate mb-2">{product.title}</h3>
            <p className="text-xl font-bold text-green-600">{product.price}</p>
          </div>
          
          {history && history.length > 0 && (
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-lg">
              <Line options={chartOptions} data={chartData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
