'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, Sparkles, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomePage() {
  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden">
      
      {/* Immersive background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-10 left-10 w-[250px] h-[250px] bg-cyan-600/5 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-indigo-600/5 rounded-full blur-[70px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6">
        
        {/* Glowing Logo Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-cyan-400 to-indigo-600 shadow-[0_0_50px_rgba(6,182,212,0.35)] border border-white/20 mb-8 group cursor-pointer"
        >
          {/* Pulsing outer ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-500 to-indigo-600 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
          <Shield className="w-12 h-12 text-white relative z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] animate-pulse" />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-sans font-black text-6xl md:text-8xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 mb-2 filter drop-shadow-[0_5px_15px_rgba(6,182,212,0.15)]"
        >
          VECTOR
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="font-sans font-semibold text-base md:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 mb-8 uppercase"
        >
          AI Procurement Negotiation Assistant
        </motion.p>

        {/* Project Authors / Caption */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300 tracking-wide mb-12 shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>A project by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">Shivam & Girisha</span></span>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <Link
            href="/home"
            className="group relative inline-flex items-center gap-3 px-8 py-5 rounded-2xl font-sans font-bold text-sm tracking-widest uppercase text-white bg-gradient-to-r from-cyan-500 to-indigo-600 border border-white/10 shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
