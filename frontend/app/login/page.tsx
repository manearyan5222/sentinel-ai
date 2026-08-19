'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('guard');
  const [password, setPassword] = useState('guard123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('sentinel_token', data.access_token);
        localStorage.setItem('sentinel_user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || 'Invalid username or password');
      }
    } catch (err) {
      // Local fallback for standalone demo
      if ((username === 'guard' && password === 'guard123') || (username === 'admin' && password === 'admin123')) {
        localStorage.setItem('sentinel_user', JSON.stringify({ username, role: username.toUpperCase() }));
        router.push('/dashboard');
      } else {
        setError('Backend server unreachable. Using fallback demo credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">
            Sentinel<span className="text-blue-500">AI</span> SOC
          </h1>
          <p className="text-xs text-slate-400">
            Security Operations Center Operator Portal
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px] text-slate-400">
          <div className="text-blue-400 font-bold">DEFAULT SEEDED DEMO LOGINS:</div>
          <div>Guard: <span className="text-white">guard</span> / <span className="text-white">guard123</span></div>
          <div>Admin: <span className="text-white">admin</span> / <span className="text-white">admin123</span></div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-400 font-mono text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 font-mono block mb-1">OPERATOR USERNAME</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-mono block mb-1">SECURITY PASSCODE</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-xs"
          >
            <span>{isLoading ? 'AUTHENTICATING...' : 'ACCESS SOC CONSOLE'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 font-mono">
            Skip to Dashboard Preview (Demo Mode) →
          </Link>
        </div>

      </div>
    </div>
  );
}
