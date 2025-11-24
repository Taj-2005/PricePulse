import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your PricePulse account to track products and manage price alerts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Login() {
  return <LoginClient />;
}