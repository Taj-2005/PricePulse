import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import Navbar from "@/app/components/Navbar";
import LogoutBtn from "@/app/components/LogoutBtn";
import TrackingForm from "@/app/components/TrackingForm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PricePulse",
  description: "PricePulse is a fullstack web application that allows users to track and visualize Amazon product prices in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <Navbar AuthButton={<LogoutBtn />} />
        <div className="bg-white">{children}</div>
        <Toaster position="top-right" />
        <TrackingForm />
      </body>
    </html>
  );
}
