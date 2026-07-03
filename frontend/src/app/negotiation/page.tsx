'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useVector } from '@/context/VectorContext';
import { ShieldCheck, Mail, Copy, Check, ChevronRight, FileText, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NegotiationPage() {
  const { activeQuote } = useVector();
  const [copied, setCopied] = useState(false);

  if (!activeQuote) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Quote</h2>
        <p className="text-sm text-gray-400 mb-6">
          Please upload a quote on the Home page or select a previous analysis from the history dropdown.
        </p>
        <Link
          href="/home"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs tracking-wide text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
        >
          Go to Upload
        </Link>
      </div>
    );
  }

  const { extracted, negotiation } = activeQuote;

  const handleCopy = () => {
    if (negotiation.counteroffer_email) {
      navigator.clipboard.writeText(negotiation.counteroffer_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full py-2">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2.5 rounded-xl border border-white/10 bg-white/2 hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Negotiation Center</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Actionable items and counteroffer templates for <span className="text-cyan-400 font-semibold">{extracted.vendor_name}</span>.
          </p>
        </div>
      </div>

      {/* Recommended Deal Card */}
      <motion.div 
        className="glass-panel rounded-3xl p-6 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.06)] mb-8 bg-gradient-to-r from-cyan-950/10 to-indigo-950/10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase">
            Recommended Target Deal Parameters
          </h3>
        </div>
        <p className="text-sm md:text-base font-bold text-white leading-relaxed">
          {negotiation.final_recommendation}
        </p>
      </motion.div>

      {/* Negotiation Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Negotiation Strategy Points */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-1 px-4 rounded-xl border border-white/5 bg-white/2 self-start">
            <h3 className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase py-1">
              Leverage Strategies
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            {negotiation.strategy && negotiation.strategy.length > 0 ? (
              negotiation.strategy.map((point, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-slate-950/20 glass-panel-hover"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0 mt-0.5">
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                  </div>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                    {point}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="text-xs text-gray-500 py-6 text-center">
                No custom strategy bullet points generated.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Counteroffer Email Template */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase">
                Professional Counteroffer Email
              </h3>
            </div>
            
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white/90 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer select-none active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copy Email</span>
                </>
              )}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="w-full rounded-3xl border border-white/5 bg-[#070915]/60 backdrop-blur-md p-6 font-mono text-xs md:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap shadow-xl max-h-[500px] overflow-y-auto border-t-cyan-500/20">
              {negotiation.counteroffer_email}
            </div>
          </motion.div>

          <div className="text-[10px] text-gray-500 italic text-center px-4">
            Note: This email is generated offline based on the comparison of quoted parameters with market pricing fetched via local MCP tools. Double check names and values before sending.
          </div>
        </div>

      </div>

    </div>
  );
}
