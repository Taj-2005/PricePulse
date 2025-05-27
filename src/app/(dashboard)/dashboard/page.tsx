import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DashboardClient from "@/app/components/DashboardClient";

export default async function DashboardPage() {
  const token = (await cookies()).get("token")?.value;

  if (!token) return <div className="p-6 text-red-500">Unauthorized</div>;

  const user = jwt.decode(token) as { email: string };
  const userEmail = user?.email;

  return <DashboardClient userEmail={userEmail} />;
}