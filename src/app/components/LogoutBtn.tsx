'use client';
import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const Logout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to sign out');
      }

      // Clear any client-side token storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }

      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('Failed to sign out');
      // Force redirect even if API call fails
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <div className='flex flex-row justify-center items-center gap-3'>
      <div className='flex items-center justify-center rounded-full p-2 bg-gray-100 border border-gray-200'>
        <User className="w-5 h-5 text-gray-600" aria-hidden="true" />
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Logout from your account"
      >
        <span className="hidden sm:inline">Logout</span>
        <LogOut className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Logout;
