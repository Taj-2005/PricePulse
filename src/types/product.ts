export interface Product {
  title: string;
  _id: string;
  url: string;
  currentPrice: number | string; // Can be string or number from database
  userEmail: string;
  imageUrl?: string;
  lastScrapedAt?: string;
  createdAt?: string;
}

