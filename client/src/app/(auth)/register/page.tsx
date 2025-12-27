'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.access_token) {
        auth.setToken(response.access_token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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

        {/* Sign Up Form Card */}
        <div className="bg-[#1a1f26] border border-[#2d3139] rounded-lg p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-[#e8eaed] mb-6">Sign Up</h2>

          {error && (
            <div className="mb-6 p-3 bg-[#3d1a1a] border border-[#8b3a3a] rounded text-[#ff6b6b] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#9aa0a6] mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3139] rounded text-[#e8eaed] placeholder-[#5f6368] focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2] transition-colors"
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#9aa0a6] mb-2">
                Email id
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3139] rounded text-[#e8eaed] placeholder-[#5f6368] focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2] transition-colors"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {/* Re-Enter Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#9aa0a6] mb-2">
                Re-Enter password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3139] rounded text-[#e8eaed] placeholder-[#5f6368] focus:outline-none focus:border-[#4a90e2] focus:ring-1 focus:ring-[#4a90e2] transition-colors"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4a90e2] text-white py-3 px-4 rounded font-medium hover:bg-[#5a9ff2] focus:outline-none focus:ring-2 focus:ring-[#4a90e2] focus:ring-offset-2 focus:ring-offset-[#1a1f26] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm">
            <span className="text-[#9aa0a6]">Already have an account?</span>
            {' '}
            <Link 
              href="/login" 
              className="text-[#4a90e2] hover:text-[#5a9ff2] transition-colors font-medium"
            >
              Sign in
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
