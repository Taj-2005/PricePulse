import Image from 'next/image';
import { LogOut } from "lucide-react";
import { User } from "lucide-react"
import Logout from '@/app/components/Logout';

const Navbar = () => {
  return (
    <div className="w-full bg-white px-6 py-3 flex items-center justify-between shadow-2xl border-b-1 border-slate-300">
    {/* Logo + Title */}
    <div className="flex items-center gap-4">
        <Image
        src="/pricepulse.png"
        width={50}
        height={50}
        alt="PricePulse Logo"
        className="rounded-lg shadow"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
        PricePulse
        </h1>
    </div>

    {/* Logout Button */}
    <Logout />
    </div>
  )
}

export default Navbar
