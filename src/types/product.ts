export interface Product {
  title: string;
  _id: string;
  url: string;
  currentPrice: number | string; 
  userEmail: string;
  imageUrl?: string;
  lastScrapedAt?: string;
  createdAt?: string;
}

