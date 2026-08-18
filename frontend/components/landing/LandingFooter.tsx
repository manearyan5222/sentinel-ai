'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Github, ArrowUpRight } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-[#07090e] border-t border-white/[0.06] py-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <span className="font-extrabold text-lg tracking-wide text-white">
                Sentinel<span className="text-blue-500">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
              Intelligent security awareness for everyday CCTV streams.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="space-y-3 font-mono">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px]">PLATFORM ROUTES</span>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">SOC Dashboard</Link></li>
              <li><Link href="/alerts" className="hover:text-white transition-colors">Alert Center</Link></li>
              <li><Link href="/visitors" className="hover:text-white transition-colors">Visitor Directory</Link></li>
              <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Repository & Open Source */}
          <div className="space-y-3 font-mono">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px]">SOURCE REPOSITORY</span>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/manearyan5222/sentinel-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li><span className="text-slate-400">MIT License</span></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} SentinelAI. Intelligent Security Awareness.</p>
          <p>Human-in-the-Loop Security & Triage Decision Platform.</p>
        </div>

      </div>
    </footer>
  );
}
