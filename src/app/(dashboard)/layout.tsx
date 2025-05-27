import { Toaster } from "react-hot-toast";
import Navbar from "@/app/components/Navbar";
import LogoutBtn from "@/app/components/LogoutBtn";
import { Metadata } from "next";
import TrackingForm from "@/app/components/TrackingForm";

export const metadata: Metadata = {
  title: "PricePulse",
  description:
    "PricePulse is a fullstack web application that allows users to track and visualize Amazon product prices in real-time.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar AuthButton={<LogoutBtn />} />
      <div className="bg-white">{children}</div>
      <Toaster position="top-right" />
      <TrackingForm />
    </>
  );
}
