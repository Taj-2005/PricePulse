import Navbar from "@/app/components/Navbar";
import LoginBtn from "@/app/components/LoginBtn";
import TrackingForm from "./components/TrackingForm";
import { ArrowRight, TrendingDown, Bell, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar AuthButton={<LoginBtn />} />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 sm:py-16 lg:py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-archivo leading-tight">
                Never Miss a Deal Again
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Track Amazon product prices, set price alerts, and get instant notifications when prices drop below your target. 
                <span className="block mt-2 font-semibold text-gray-900">
                  Free • Automated • Smart
                </span>
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <TrendingDown className="w-5 h-5 text-green-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">Price Tracking</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <Bell className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">Email Alerts</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <BarChart3 className="w-5 h-5 text-purple-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">Price History</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tracking Form Section */}
        <section className="py-8 sm:py-12">
          <TrackingForm />
        </section>

        {/* Features Section */}
        <section className="bg-white py-12 sm:py-16 lg:py-20">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12 font-archivo">
                Why Choose PricePulse?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingDown className="w-8 h-8 text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Price Tracking</h3>
                  <p className="text-gray-600">
                    Automatically monitor product prices every 30 minutes and track price history over time.
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Alerts</h3>
                  <p className="text-gray-600">
                    Get email notifications the moment prices drop below your target. Never miss a deal again.
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-purple-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Price Analytics</h3>
                  <p className="text-gray-600">
                    Visualize price trends with interactive charts. View 24h, 7d, 30d, or all-time history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-12 sm:py-16">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-archivo">
                Ready to Start Tracking?
              </h2>
              <p className="text-lg text-blue-400 mb-8">
                Create a free account to manage all your tracked products in one place.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gray-500 text-blue-200 px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm sm:text-base mb-4">
              © {new Date().getFullYear()} PricePulse. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Track prices, save money, shop smarter.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}