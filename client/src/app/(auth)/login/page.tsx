'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white/6 via-[#0b1220] to-[#0f172a] flex items-center justify-center px-4 py-10 text-zinc-100">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" aria-hidden />
      <div className="absolute right-[-8rem] top-1/3 h-96 w-96 rounded-full bg-white/12 blur-3xl" aria-hidden />
      <div className="absolute left-1/3 bottom-[-10rem] h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />

      <div className="w-full max-w-xl relative z-10">
        <div className="mb-8 flex items-center gap-3 text-sky-200">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">GearGuard</p>
            <h1 className="text-2xl font-semibold text-white">Secure Access</h1>
          </div>
        </div>

        <div className="relative bg-[#0b0f1a]/80 backdrop-blur-xl border border-[#1f2937] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" aria-hidden />
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Welcome back</p>
              <h2 className="text-xl font-semibold text-white">Sign in to your workspace</h2>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <p>Admin: john.admin@gearguard.com</p>
              <p>Any password accepted in mock mode</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-200">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0c1220] border border-[#1f2937] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-200">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0c1220] border border-[#1f2937] text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-500 text-white font-semibold shadow-lg shadow-sky-900/30 hover:from-sky-500 hover:via-indigo-500 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-[#0a0e1a] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-zinc-400">
            <div>
              <span className="text-zinc-500 mr-2">Need an account?</span>
              <Link href="/register" className="text-sky-300 hover:text-sky-200 font-semibold">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
