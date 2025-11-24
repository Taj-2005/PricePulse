"use client";

import { Toaster } from "react-hot-toast";
import Navbar from "@/app/components/Navbar";
import LogoutBtn from "@/app/components/LogoutBtn";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar AuthButton={<LogoutBtn />} />
      <div className="bg-gray-50 min-h-screen">{children}</div>
      <Toaster position="top-right" />
    </>
  );
}
