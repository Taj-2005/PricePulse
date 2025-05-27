// Navbar.tsx
'use client';

import Image from 'next/image';
import React from 'react';

interface NavbarProps {
  AuthButton: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ AuthButton }) => {
  return (
    <div className="w-full bg-white px-6 py-3 flex items-center justify-between shadow-lg border-b border-slate-300 sticky top-0 z-50">
      {/* Logo + Title */}
      <div className="flex items-center gap-4">
        <Image
          src="/pricepulse.png"
          width={50}
          height={50}
          alt="PricePulse Logo"
          className="rounded-lg shadow"
        />
        <h1 className="text-2xl sm:text-3xl font-bold font-archivo text-gray-800 tracking-tight">
          PricePulse
        </h1>
      </div>

      {AuthButton}
    </div>
  );
};

export default Navbar;
