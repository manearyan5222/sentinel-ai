'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Sparkles, ArrowRight, Menu, X, Cpu } from 'lucide-react';

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Product', href: '#see-threats' },
    { label: 'How it works', href: '#human-review' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#07090e]/85 backdrop-blur-2xl border-b border-white/[0.06] py-4 shadow-xl'
          : 'bg-transparent py-6 md:py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center group-hover:border-blue-500/40 transition-colors">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-extrabold text-lg tracking-wide text-white">
            Sentinel<span className="text-blue-500">AI</span>
          </span>
        </Link>

        {/* Minimal Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-10 text-xs font-medium text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors py-1 relative text-slate-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Single Clean Open Dashboard CTA */}
        <div className="hidden md:flex items-center">
          <Link
            href="/dashboard"
            className="group px-5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-2 border border-white/10 transition-all hover:border-white/20 active:scale-[0.98]"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#07090e]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 space-y-4 animate-fade-in">
          <div className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-800/80">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
