import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import AlertsClient from "./AlertsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Active Alerts",
  description: "View and manage your active price alerts. Track when products drop below your target prices.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AlertsPage() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-2">Unauthorized</h2>
          <p className="text-sm">Please log in to view your alerts.</p>
        </div>
      </div>
    );
  }

  const user = jwt.decode(token) as { email: string };
  const userEmail = user?.email;

  return <AlertsClient userEmail={userEmail} />;
}

