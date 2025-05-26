'use client';

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import LogoutBtn from "@/app/components/LogoutBtn";
import TrackingForm from "@/app/components/TrackingForm";


export default function Dashboard() {
  const [trackedProducts, setTrackedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount, fetch tracked products for user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          toast.error("Please login to access dashboard");
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setTrackedProducts(data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p className="text-center mt-20 text-black">Loading...</p>;

  if (trackedProducts.length === 0)
    return (
        <>
            <Navbar AuthButton={<LogoutBtn />}/>
            <p className="text-center text-black p-5 bg-white">
                No tracked products found. Add some from the main page.
            </p>
            <TrackingForm />
        </>
    );

  return (
    <>
        <Navbar AuthButton={<LogoutBtn />}/>
        <main className="max-w-5xl mx-auto px-4 py-10 text-black">
        <h1 className="text-3xl font-bold mb-6">Your Tracked Products</h1>

        <button
            className="mb-8 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
            }}
        >
            Logout
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trackedProducts.map((item) => {
            const history = item.history || [];

            const chartData = {
                labels: history.map((h: any) =>
                new Date(h.timestamp).toLocaleString()
                ),
                datasets: [
                {
                    label: "Price (₹)",
                    data: history.map((h: any) =>
                    parseFloat(h.price.toString().replace(/[^0-9.-]+/g, "")) || 0
                    ),
                    fill: false,
                    borderColor: "#2563EB",
                    backgroundColor: "#2563EB",
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                },
                ],
            };

            return (
                
                <div
                key={item._id}
                className="p-6 border rounded-xl shadow-md bg-white text-black"
                >
                <h2 className="text-xl font-semibold mb-2 truncate">
                    {item.product?.title}
                </h2>
                {item.product?.image && (
                    <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-full h-48 object-contain mb-4"
                    />
                )}
                <Line data={chartData} options={{ responsive: true }} />
                <p className="mt-2 font-semibold text-green-700">
                    Current Price: ₹ {item.product?.price || "N/A"}
                </p>
                </div>
            );
            })}
        </div>
        </main>
    </>
  );
}
