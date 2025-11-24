import { useState } from "react";
import React from "react";
import { Loader2, ExternalLink, Trash2, BarChart3, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { Product } from "@/types/product";

interface TrackedListProps {
  products: Product[];
  handleClick: (url: string) => void;
  onDelete?: (productId: string) => void;
}

const TrackedList: React.FC<TrackedListProps> = ({ products, handleClick, onDelete }) => {
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent card click
    
    // Use custom confirmation toast
    const confirmed = await new Promise<boolean>((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-3 p-2">
            <p className="text-sm font-medium text-gray-900">
              Are you sure you want to remove this product from tracking?
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
                Remove
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

    setDeletingProductId(productId);
    try {
      const res = await fetch(`/api/tracked?id=${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product");
      }

      toast.success("Product removed from tracking");
      if (onDelete) {
        onDelete(productId);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white p-5 sm:p-6 shadow-md rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 group relative flex flex-col"
        >
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={(e) => handleDelete(e, product._id)}
              disabled={deletingProductId === product._id}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Delete ${product.title}`}
              title="Remove from tracking"
            >
              {deletingProductId === product._id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Product Image */}
          {product.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-lg bg-gray-50">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-40 sm:h-44 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}

          {/* Product Info */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-gray-900 text-base sm:text-lg font-semibold line-clamp-2 mb-3 min-h-[3rem] pr-8">
            {product.title}
          </h3>
            
            <div className="mt-auto">
              {/* Price */}
              <div className="mb-4">
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  ₹{typeof product.currentPrice === 'string' 
                    ? parseFloat(product.currentPrice.replace(/[₹,\s]/g, '')).toLocaleString('en-IN')
                    : product.currentPrice.toLocaleString('en-IN')}
          </p>
              </div>

              {/* Metadata */}
              <div className="space-y-2 mb-4 text-xs text-gray-500">
                {product.lastScrapedAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Last updated: {formatDate(product.lastScrapedAt)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleClick(product.url)}
                  disabled={loadingProductId === product._id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  aria-label={`View price history for ${product.title}`}
                >
                  {loadingProductId === product._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" aria-hidden="true" />
                      <span>View History</span>
                    </>
                  )}
                </button>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label={`View ${product.title} on Amazon`}
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm">Amazon</span>
                </a>
          </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackedList;
