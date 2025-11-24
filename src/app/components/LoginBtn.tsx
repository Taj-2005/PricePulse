"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

const LoginButton = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className='flex flex-row justify-center items-center gap-3'>
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Login to your account"
      >
        <span>Login</span>
        <LogIn className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default LoginButton;
