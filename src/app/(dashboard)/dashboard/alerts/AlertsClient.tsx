"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  Bell, 
  Trash2, 
  ExternalLink, 
  ArrowLeft, 
  TrendingDown, 
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";

interface Alert {
  _id: string;
  productId: {
    _id: string;
    title: string;
    url: string;
    currentPrice: number;
    imageUrl?: string;
  };
  userEmail: string;
  targetPrice: number;
  alerted: boolean;
  lastAlertPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AlertsClient({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [userEmail]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts?userEmail=${encodeURIComponent(userEmail)}`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    // Use custom confirmation toast
    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-3 p-2">
            <p className="text-sm font-medium text-gray-900">
              Are you sure you want to delete this alert?
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          style: {
            padding: "1rem",
            maxWidth: "400px",
          },
        }
      );
    });

    if (!confirmed) {
      return;
    }

    setDeletingId(alertId);
    try {
      const res = await fetch(`/api/alerts?id=${alertId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete alert");
      }

      toast.success("Alert deleted successfully");
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete alert");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isPriceBelowTarget = (currentPrice: number, targetPrice: number) => {
    return currentPrice <= targetPrice;
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="container-custom py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-archivo">
                Active Alerts
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Manage your price drop alerts
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading your alerts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && alerts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-md mx-auto text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-archivo">
              No Alerts Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't set up any price alerts. Add a target price when tracking a product to receive alerts.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all font-semibold"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Alerts List */}
        {!loading && alerts.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-600">
                You have <span className="font-semibold text-gray-900">{alerts.length}</span> active alert{alerts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {alerts.map((alert) => {
                const product = alert.productId;
                const isActive = isPriceBelowTarget(
                  product?.currentPrice || 0,
                  alert.targetPrice
                );
                const priceDiff = product?.currentPrice
                  ? alert.targetPrice - product.currentPrice
                  : 0;
                const priceDiffPercent = product?.currentPrice
                  ? ((priceDiff / product.currentPrice) * 100).toFixed(1)
                  : 0;

                return (
                  <div
                    key={alert._id}
                    className={`bg-white rounded-xl p-6 border-2 shadow-md transition-all ${
                      isActive
                        ? "border-green-200 bg-green-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Product Info */}
                    <div className="flex gap-4 mb-4">
                      {product?.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={product.imageUrl}
                            alt={product.title || "Product"}
                            className="w-20 h-20 object-contain rounded-lg bg-gray-50 border border-gray-200"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                          {product?.title || "Product"}
                        </h3>
                        {product?.url && (
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View on Amazon
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Current Price</span>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product?.currentPrice?.toLocaleString("en-IN") || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700 font-medium">Target Price</span>
                        <span className="text-lg font-bold text-blue-600">
                          ₹{alert.targetPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isActive && (
                      <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-800">
                              Price Alert Active!
                            </p>
                            <p className="text-xs text-green-700">
                              Price is ₹{Math.abs(priceDiff).toLocaleString("en-IN")} ({Math.abs(Number(priceDiffPercent))}%) below your target
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isActive && product?.currentPrice && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-800">
                              Waiting for price drop
                            </p>
                            <p className="text-xs text-yellow-700">
                              Need ₹{priceDiff.toLocaleString("en-IN")} more drop to reach target
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Alert Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created {formatDate(alert.createdAt)}</span>
                      </div>
                      {alert.alerted && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          Alerted
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(alert._id)}
                        disabled={deletingId === alert._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                        aria-label={`Delete alert for ${product?.title}`}
                      >
                        {deletingId === alert._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Alert</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

