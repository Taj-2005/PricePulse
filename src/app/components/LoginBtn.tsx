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
    <div className='flex flex-row justify-center items-center gap-4'>
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow transition-colors duration-200"
      >
        <span>Login</span>
        <LogIn className="w-5 h-5" />
      </button>
    </div>
  );
};

export default LoginButton;
