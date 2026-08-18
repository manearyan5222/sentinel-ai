'use client';

import React from 'react';
import { Code2, Terminal, Cpu, Database, Sparkles, Layers } from 'lucide-react';

export function LandingTechSection() {
  const stack = [
    { name: 'Next.js 14 & React 18', role: 'Frontend Framework & App Router', cat: 'FRONTEND' },
    { name: 'Tailwind CSS & Framer Motion', role: 'Design System & Animations', cat: 'STYLING' },
    { name: 'Python FastAPI', role: 'Async REST & WebSocket API', cat: 'BACKEND' },
    { name: 'OpenCV & Ultralytics YOLOv8', role: 'Computer Vision & Centroid Tracking', cat: 'AI VISION' },
    { name: 'Google Gemini API', role: 'Non-blocking AI Decision Layer', cat: 'AI LLM' },
    { name: 'SQLite & SQLAlchemy', role: 'Local Event Caching Database', cat: 'DATABASE' },
  ];

  return (
    <section id="tech-stack" className="py-24 md:py-36 bg-slate-950/90 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-mono font-semibold">
            <Code2 className="w-3.5 h-3.5" />
            <span>10 // VERIFIED TECHNICAL STACK</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Engineered with modern <br />
            <span className="text-blue-400">open technology standards.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stack.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                  {item.cat}
                </span>
              </div>
              <div className="font-bold text-white text-sm">{item.name}</div>
              <div className="text-slate-400 text-[11px]">{item.role}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
