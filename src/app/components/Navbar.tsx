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
          src="/pricepulse4.png"
          width={100}
          height={100}
          alt="PricePulse Logo"
          className="rounded-lg"
        />
      </div>

      {AuthButton}
    </div>
  );
};

export default Navbar;
