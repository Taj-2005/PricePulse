import { useState } from "react";
import React from "react";
import { Loader2 } from "lucide-react";

interface Product {
  title: string;
  _id: string;
  url: string;
  currentPrice: number;
  userEmail: string;
}

interface TrackedListProps {
  products: Product[];
  handleClick: (url: string) => void;
}

const TrackedList: React.FC<TrackedListProps> = ({ products, handleClick }) => {
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white p-4 shadow-xl rounded-xl mb-4 w-full max-w-md cursor-pointer hover:scale-101 transition duration-300"
          onClick={async () => {
            setLoadingProductId(product._id);
            await handleClick(product.url);
            setLoadingProductId(null);
          }}
        >
          <h3 className="text-black text-lg font-semibold truncate overflow-hidden whitespace-nowrap">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 truncate">{product.url}</p>
          <p className="text-black">{product.currentPrice}</p>
          {loadingProductId === product._id && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="animate-spin text-blue-500" />
              <span className="text-sm text-blue-500">Loading...</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrackedList;
