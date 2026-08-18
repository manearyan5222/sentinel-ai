'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Cpu, Activity, Bell, Video, Users, BarChart3, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { SystemStatus, AIStatus } from '../lib/types';
import { fetchAIStatus } from '../lib/api';

interface SOCHeaderProps {
  systemStatus: SystemStatus | null;
  isConnected: boolean;
  activeAlertCount: number;
}

export function SOCHeader({ systemStatus, isConnected, activeAlertCount }: SOCHeaderProps) {
  const pathname = usePathname();
  const [timeString, setTimeString] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<AIStatus>({ status: 'DISABLED', message: 'Loading AI status...' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    fetchAIStatus().then(setAiStatus);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'SOC Live Grid', href: '/dashboard', icon: Video },
    { label: 'Alert Center', href: '/alerts', icon: Bell, badge: activeAlertCount > 0 ? activeAlertCount : undefined },
    { label: 'Visitor Directory', href: '/visitors', icon: Users },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const getAiBadgeColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
      case 'ERROR': return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
      case 'RATE_LIMITED': return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
      default: return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Platform Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg flex items-center justify-center group-hover:border-blue-400 transition-colors">
            <Shield className="w-6 h-6 text-blue-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-wider text-slate-100 uppercase">
                Sentinel<span className="text-blue-500">AI</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-950 text-blue-300 border border-blue-800">
                SOC PLATFORM
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Smarter CCTV. Faster Security Response.
            </p>
          </div>
        </Link>


        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Real-Time System Telemetry & AI Hardware Status */}
        <div className="flex items-center gap-3">
          
          {/* Gemini AI Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-mono ${getAiBadgeColor(aiStatus.status)}`}>
            <Sparkles className={`w-4 h-4 ${aiStatus.status === 'ONLINE' ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <div>
              <span className="text-slate-400 text-[10px] block leading-none">GEMINI LAYER</span>
              <span className="font-bold">
                AI: {aiStatus.status}
              </span>
            </div>
          </div>

          {/* AI Device Hardware Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <Cpu className={`w-4 h-4 ${systemStatus?.ai_device === 'CUDA_GPU' ? 'text-purple-400 animate-pulse' : 'text-amber-400'}`} />
            <div>
              <span className="text-slate-400 text-[10px] block leading-none">AI DEVICE</span>
              <span className={`font-bold ${systemStatus?.ai_device === 'CUDA_GPU' ? 'text-purple-300' : 'text-amber-300'}`}>
                {systemStatus?.ai_device === 'CUDA_GPU' ? 'GPU (CUDA)' : 'CPU Mode'}
              </span>
            </div>
          </div>

          {/* WebSocket Live Sync Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400" />
            )}
            <div>
              <span className="text-slate-400 text-[10px] block leading-none">REAL-TIME PUSH</span>
              <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Clock */}
          <div className="hidden xl:flex flex-col text-right font-mono bg-slate-900 px-3 py-1 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">SOC UTC CLOCK</span>
            <span className="text-xs font-bold text-blue-400">{timeString || '00:00:00'}</span>
          </div>

        </div>

      </div>
    </header>
  );
}
