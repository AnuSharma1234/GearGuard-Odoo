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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
            GearGuard
          </h1>
          <p className="text-[#666666] text-sm">Sign in to continue</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-8">
          {error && (
            <div className="mb-6 p-3 bg-[#141414] border border-[#ef4444] rounded text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-[#1f1f1f] rounded text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-3 px-4 rounded font-medium hover:bg-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[#666666]">Don't have an account?</span>
            {' '}
            <Link 
              href="/register" 
              className="text-white hover:text-[#a0a0a0] transition-colors font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
