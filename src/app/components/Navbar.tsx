// Navbar.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface NavbarProps {
  AuthButton: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ AuthButton }) => {
  return (
    <nav 
      className="w-full bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm border-b border-gray-200 sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo + Title */}
      <Link 
        href="/" 
        className="flex items-center gap-3 sm:gap-4 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        aria-label="PricePulse Home"
      >
        <Image
          src="/pricepulse4.png"
          width={48}
          height={48}
          alt="PricePulse Logo"
          className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 object-contain"
          priority
          quality={90}
        />
        <span className="hidden sm:block text-xl sm:text-2xl font-bold text-gray-900 font-archivo">
          PricePulse
        </span>
      </Link>

      <div className="flex items-center">
        {AuthButton}
      </div>
    </nav>
  );
};

export default Navbar;
