"use client";

import { useEffect, useState, useRef } from "react";
import TrackingForm from "@/app/components/TrackingForm";
import TrackedList from "@/app/components/TrackedList";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";
import { Line } from "react-chartjs-2";
import Link from "next/link";
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

import { Product } from "@/types/product";

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const [product, setProduct] = useState<{ title: string; price: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ price: string; timestamp: string }[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const historySectionRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tracked?userEmail=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        const productList = data.products || data;
        const filtered = productList.filter((product: Product) => product.userEmail === userEmail);
        setProducts(filtered);
        if (data.totalValue !== undefined) {
          setTotalValue(data.totalValue);
        } else if (filtered.length > 0) {
          const validPrices = filtered
            .map((p: Product) => {
              const price = p.currentPrice;
              if (price == null) return null;
              
              if (typeof price === 'number') {
                return isNaN(price) || price <= 0 ? null : price;
              }
              
              if (typeof price === 'string') {
                const cleaned = price.replace(/[₹,\s]/g, '');
                const parsed = parseFloat(cleaned);
                return isNaN(parsed) || parsed <= 0 ? null : parsed;
              }
              
              return null;
            })
            .filter((price: number | null) => price != null) as number[];
          
          if (validPrices.length > 0) {
            const sum = validPrices.reduce((acc: number, price: number) => acc + price, 0);
            setTotalValue(Math.round(sum));
          }
        }
        if (filtered.length === 0) setShowForm(true);
      } catch (err) {
        setError("Oops! Could not load your tracked products. Please try again.");
        toast.error("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProducts();
  }, [userEmail]);

  const handleAddClick = () => {
    setHistory([]);
    setProduct(null);
    setShowForm(true);
  };

  const handleFormSubmit = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    if (product && product.title) {
      setProduct(null);
      setHistory([]);
    }
    fetchProducts();
  };

  const productFetch = async (url: string) => {
    setFetchingHistory(true);
    setProduct(null);
    setHistory([]);
    
    const loadingToast = toast.loading("Fetching product data...", {
      duration: 5000,
    });

    try {
      setTimeout(() => {
        historySectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const body: any = { url };
      let res: Response;
      let text: string;

      try {
        res = await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error("Request timed out. Please try again.");
        }
        throw fetchError;
      }

      text = await res.text();
      let response: any;
      try {
        response = JSON.parse(text);
      } catch (parseError) {
        console.error("[DashboardClient] Invalid JSON response:", text.substring(0, 200));
        throw new Error("Invalid JSON response from server");
      }

      if (!res.ok) {
        const errorMessage = response?.error?.message || response?.error || "Unknown server error";
        throw new Error(errorMessage);
      }

      if (!response.success || !response.data) {
        const errorMessage = response?.error?.message || "Invalid response format";
        throw new Error(errorMessage);
      }

      const data = response.data;
      if (!data.title || !data.price) {
        throw new Error("Incomplete product data");
      }

      setProduct({ title: data.title, price: data.price });
      toast.dismiss(loadingToast);

      if (data.cached) {
        toast.success(`Loaded cached data: ${data.title}`, {
          icon: "📦",
        });
      } else {
        toast.success("Product data loaded");
      }

      // Fetch history (non-blocking - don't fail if this errors)
      try {
        const historyRes = await fetch(`/api/history?url=${encodeURIComponent(data.url || url)}`);
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData);
        } else {
          console.warn("[DashboardClient] Failed to fetch price history (non-critical)");
        }
      } catch (historyError: any) {
        console.warn("[DashboardClient] Error fetching history (non-critical):", historyError.message);
        // Don't throw - history is nice to have but not critical
      }
      
      setTimeout(() => {
        historySectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    } catch (err: any) {
      console.error("[DashboardClient] Error fetching product:", {
        message: err.message,
        url,
      });
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to fetch product data");
      setProduct(null);
      setHistory([]);
    } finally {
      setFetchingHistory(false);
    }
  };

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
        data: (history ?? []).map((entry) => {
          const priceStr = entry?.price ?? "";
          return parseFloat(priceStr.toString().replace(/[^0-9.-]+/g, "")) || 0;
        }),
        fill: true,
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        pointRadius: history.length > 20 ? 0 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#2563EB",
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

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="container-custom py-6 sm:py-8 lg:py-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2 font-archivo">
                Your Dashboard
          </h1>
              <p className="text-gray-600 text-base">
                Manage your tracked products and monitor price changes
              </p>
            </div>
            {!showForm && products.length > 0 && (
              <button
                onClick={handleAddClick}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 font-semibold text-sm sm:text-base"
                aria-label="Add a new product to track"
              >
                <PlusCircle className="w-5 h-5" aria-hidden="true" />
                <span>Add Product</span>
              </button>
            )}
          </div>

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                    <p className="text-sm text-gray-600">Tracked Products</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{totalValue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-600">Total Value</p>
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard/alerts"
                className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      View Alerts
                    </p>
                    <p className="text-sm text-gray-600">Manage price alerts</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" aria-label="Loading"></div>
            <p className="text-gray-600 text-lg font-medium">
            Loading your tracked products...
          </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 font-semibold p-4 sm:p-6 rounded-lg shadow-sm max-w-2xl mx-auto" role="alert">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !showForm && products.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Tracked Products</h2>
              <TrackedList 
                handleClick={productFetch} 
                products={products} 
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        {!loading && showForm && (
          <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-lg w-full mx-auto max-w-4xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-archivo">
                {products.length === 0
                  ? "Start Tracking Your First Product"
                  : "Add a New Product"}
              </h2>
              <p className="text-gray-600">
              {products.length === 0
                  ? "Paste an Amazon product URL to begin tracking its price"
                  : "Add another product to your tracking list"}
            </p>
            </div>
            <TrackingForm defaultEmail={userEmail} />
          </div>
        )}

        {!loading && !showForm && products.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md w-full text-center border border-gray-200">
            <img
              src="/empty-state.svg"
              alt="No tracked products"
                className="w-48 h-48 sm:w-64 sm:h-64 object-contain mx-auto mb-6 opacity-90"
                loading="lazy"
            />
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-archivo">
                No Products Yet
              </h3>
              <p className="text-gray-600 mb-8 text-base">
                Start tracking your first product to see price history and get alerts when prices drop!
            </p>
            <button
              onClick={handleAddClick}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 font-semibold w-full sm:w-auto mx-auto"
                aria-label="Add your first product to track"
            >
                <PlusCircle className="w-5 h-5" aria-hidden="true" />
                Add Your First Product
            </button>
            </div>
          </div>
        )}

        <div ref={historySectionRef}>
          {fetchingHistory && !product && (
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-64 sm:h-80 md:h-96 bg-gray-100 rounded-xl"></div>
              </div>
      </div>
          )}
      {product && (
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
              {product.title}
            </h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-green-600">
                    {product.price}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProduct(null);
                    setHistory([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  aria-label="Close price history"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
          </div>

          {history && history.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
                <div className="h-64 sm:h-80 md:h-96">
              <Line options={chartOptions} data={chartData} />
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
