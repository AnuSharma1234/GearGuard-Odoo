'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#e8eaed] tracking-tight mb-2">
            GearGuard
          </h1>
          <p className="text-[#9aa0a6] text-sm">The Ultimate Maintenance Tracker</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#1a1f26] border border-[#2d3139] rounded-lg p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-[#e8eaed] mb-6">Sign in</h2>

          {error && (
            <div className="mb-6 p-3 bg-[#3d1a1a] border border-[#8b3a3a] rounded text-[#ff6b6b] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#9aa0a6] mb-2">
                Email id
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3139] rounded text-[#e8eaed] placeholder-[#5f6368] focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2] transition-colors"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#9aa0a6] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3139] rounded text-[#e8eaed] placeholder-[#5f6368] focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2] transition-colors"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4a90e2] text-white py-3 px-4 rounded font-medium hover:bg-[#5a9ff2] focus:outline-none focus:ring-2 focus:ring-[#4a90e2] focus:ring-offset-2 focus:ring-offset-[#1a1f26] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm">
            <Link 
              href="/forgot-password" 
              className="text-[#4a90e2] hover:text-[#5a9ff2] transition-colors"
            >
              Forgot Password?
            </Link>
            <span className="text-[#5f6368] mx-2">|</span>
            <Link 
              href="/register" 
              className="text-[#4a90e2] hover:text-[#5a9ff2] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-[#5f6368] mt-8">
          Secure maintenance management for your operations
        </p>
      </div>
    </div>
  );
}
