function isValidAmazonUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      hostname.includes("amazon.") ||
      hostname.includes("amzn.in") ||
      hostname.includes("amzn.to")
    ) && (
      urlObj.pathname.includes("/dp/") ||
      urlObj.pathname.includes("/gp/product/") ||
      url.includes("/dp/") ||
      url.includes("/gp/product/")
    );
  } catch {
    return false;
  }
}

function extractProductUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes("amzn.in") || urlObj.hostname.includes("amzn.to")) {
      return url;
    }
    
    const pathParts = urlObj.pathname.split("/");
    const dpIndex = pathParts.indexOf("dp");
    const gpIndex = pathParts.indexOf("gp");
    
    if (dpIndex !== -1 && pathParts[dpIndex + 1]) {
      urlObj.pathname = `/dp/${pathParts[dpIndex + 1]}`;
      urlObj.search = "";
      urlObj.hash = "";
      return urlObj.toString();
    }
    
    if (gpIndex !== -1 && pathParts[gpIndex + 2]) {
      urlObj.pathname = `/gp/product/${pathParts[gpIndex + 2]}`;
      urlObj.search = "";
      urlObj.hash = "";
      return urlObj.toString();
    }
    
    return url;
  } catch {
    return url;
  }
}

export { isValidAmazonUrl, extractProductUrl };

