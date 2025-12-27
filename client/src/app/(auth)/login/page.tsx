'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/lib/auth';
import usersData from '../../../../data/users.json';
import { User } from '@/types/users';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [testUserId, setTestUserId] = useState((usersData as User[])[0]?.id ?? '');
  const login = useAuthStore((state) => state.login);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4">
      <div className="w-full max-w-lg space-y-6 bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-zinc-400">Use your credentials or enable test access.</p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-zinc-300">Email</label>
            <input
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-700"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-zinc-300">Password</label>
            <input
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-700"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-sky-700 hover:bg-sky-600 text-sm font-medium px-3 py-2"
          >
            Sign in
          </button>
        </form>

        <div className="border-t border-zinc-800 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-zinc-200">Test access (no backend)</p>
              <p className="text-xs text-zinc-400">Select a dummy user to bypass auth for testing.</p>
            </div>
          </div>
          <div className="space-y-3">
            <select
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-700"
            >
              {(usersData as User[]).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const user = (usersData as User[]).find((u) => u.id === testUserId);
                if (!user) return;
                // Set a dummy token and user locally and via cookie so middleware/layout see it
                auth.setToken('test-token');
                auth.setUser(user);
                document.cookie = `auth_token=test-token; path=/;`;
                setUser(user);
                router.push('/dashboard');
              }}
              className="w-full rounded-md bg-amber-700 hover:bg-amber-600 text-sm font-medium px-3 py-2"
              type="button"
            >
              Enable test access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
