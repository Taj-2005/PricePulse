import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import getFriendlyErrorMessage from "@/lib/errors";

interface ProductData {
  id?: string;
  title: string;
  price: string;
  priceNumber?: number;
  imageUrl?: string;
  url?: string;
  cached?: boolean;
}

interface UseProductFetchOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToasts?: boolean;
}

interface UseProductFetchReturn {
  fetchProduct: (url: string, userEmail?: string, targetPrice?: number) => Promise<ProductData | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for fetching product data with automatic retries and error handling
 */
export function useProductFetch(options: UseProductFetchOptions = {}): UseProductFetchReturn {
  const { maxRetries = 3, retryDelay = 2000, showToasts = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(
    async (
      url: string,
      userEmail?: string,
      targetPrice?: number
    ): Promise<ProductData | null> => {
      setLoading(true);
      setError(null);

      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const body: any = { url };
          if (userEmail) body.userEmail = userEmail;
          if (targetPrice) body.targetPrice = targetPrice;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

          try {
            const res = await fetch("/api/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const text = await res.text();
            let data: any;

            try {
              data = JSON.parse(text);
            } catch (parseError) {
              throw new Error("Invalid JSON response from server");
            }

            if (!res.ok) {
              const errorMsg = data?.error || "Unknown server error";
              
              // If we have cached data, use it as fallback
              if (data?.cached === true && data.title && data.price) {
                console.warn("[useProductFetch] Using cached data despite error:", errorMsg);
                setLoading(false);
                setError(null);
                if (showToasts) {
                  toast.success(`Loaded cached data for ${data.title}`, {
                    icon: "📦",
                  });
                }
                return data as ProductData;
              }

              throw new Error(errorMsg);
            }

            if (!data.title || !data.price) {
              throw new Error("Incomplete product data received from server");
            }

            // Success!
            setLoading(false);
            setError(null);

            if (showToasts) {
              if (data.cached) {
                toast.success(`Loaded cached data: ${data.title}`, {
                  icon: "📦",
                });
              } else {
                toast.success("Product data loaded successfully");
              }
            }

            return data as ProductData;
          } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === "AbortError") {
              throw new Error("Request timed out. Please try again.");
            }
            throw fetchError;
          }
        } catch (err: any) {
          lastError = err;
          const errorMessage = err.message || "Failed to fetch product data";
          
          console.error(`[useProductFetch] Attempt ${attempt}/${maxRetries} failed:`, errorMessage);

          // Don't retry on certain errors
          if (
            err.message?.includes("Invalid URL") ||
            err.message?.includes("valid Amazon product URL") ||
            err.message?.includes("Invalid email")
          ) {
            setLoading(false);
            setError(errorMessage);
            if (showToasts) {
              const friendlyMsg = getFriendlyErrorMessage(400, errorMessage);
              toast.error(friendlyMsg);
            }
            return null;
          }

          // If this is the last attempt, fail
          if (attempt === maxRetries) {
            setLoading(false);
            setError(errorMessage);
            
            if (showToasts) {
              // Determine status code from error message
              let statusCode: number | undefined;
              if (errorMessage.includes("timeout")) statusCode = 504;
              else if (errorMessage.includes("Unable to fetch")) statusCode = 502;
              else if (errorMessage.includes("Product not found")) statusCode = 404;
              
              const friendlyMsg = getFriendlyErrorMessage(statusCode, errorMessage);
              toast.error(friendlyMsg);
            }
            
            return null;
          }

          // Wait before retrying (exponential backoff)
          const delay = retryDelay * Math.pow(2, attempt - 1);
          console.log(`[useProductFetch] Retrying in ${delay}ms...`);
          
          if (showToasts && attempt === 1) {
            toast.loading("Retrying...", { id: "retry-toast" });
          }
          
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // Should never reach here, but TypeScript needs it
      setLoading(false);
      if (lastError) {
        setError(lastError.message);
        if (showToasts) {
          toast.dismiss("retry-toast");
          toast.error(getFriendlyErrorMessage(500, lastError.message));
        }
      }
      return null;
    },
    [maxRetries, retryDelay, showToasts]
  );

  return { fetchProduct, loading, error };
}

