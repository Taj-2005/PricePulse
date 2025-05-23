export default function getFriendlyErrorMessage(status?: number, errorMessage?: string) {
  switch (status) {
    case 400:
      return "❗ Invalid request. Please check the URL.";
    case 403:
      return "⛔ Request blocked by Amazon. Please try again later.";
    case 404:
      return "🔍 Product not found. Check if the Amazon link is correct.";
    case 429:
      return "⏱ Too many requests. Please wait a moment.";
    case 500:
      return "🚨 Server error. Please try again later.";
    case 502:
      return "🔍 Product not found. Check if the Amazon link is correct (or) Amazon may be blocking us.";
    case 503:
      return "🛠 Service unavailable. Amazon may be blocking the request.";
    case 301:
    case 302:
      return "🔄 The link redirected to a different page. Please verify the URL.";
    default:
      if (errorMessage?.includes("NetworkError")) {
        return "⚠️ Network error. Please check your internet connection.";
      }
      if (errorMessage?.includes("Invalid URL")) {
        return "❗ Invalid URL format. Please enter a valid Amazon product link.";
      }
      return "⚠️ Something went wrong. Try again.";
  }
}
