'use client';
import React from 'react';
import { User, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const Logout = () => {
  return (
    <div className='flex flex-row justify-center items-center gap-4'>
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-medium rounded-md shadow transition-colors duration-200"
      >
        <span>Logout</span>
        <LogOut className="w-5 h-5" />
      </button>
      <div className='border-1 border-black flex flex-row items-center justify-center rounded-full p-1'>
        <User className="w-6 h-6 text-gray-600 inline-block" />
      </div>
    </div>
  );
};

export default Logout;
