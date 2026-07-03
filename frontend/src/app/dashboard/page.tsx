'use client';

import React from 'react';
import Link from 'next/link';
import { useVector } from '@/context/VectorContext';
import { FileText, TrendingDown, ShieldAlert, BadgeDollarSign, Truck, Calendar, Tag, User, Star, ArrowRight, CornerDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { activeQuote } = useVector();

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

  const { extracted, market_comparison } = activeQuote;
  
  // Calculations
  const quotedUnitPrice = extracted.quantity > 0 ? (extracted.price / extracted.quantity) : extracted.price;
  const isOverpriced = quotedUnitPrice > market_comparison.market_average;
  const priceDiffPct = market_comparison.price_variance_pct;
  const absoluteDiff = Math.abs(quotedUnitPrice - market_comparison.market_average);

  // Risk coloring
  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (score < 70) return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
  };

  const getRiskLevelLabel = (score: number) => {
    if (score < 40) return 'Low Risk';
    if (score < 70) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="relative w-full py-2">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Quote Analysis Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Comparing terms for <span className="text-cyan-400 font-semibold">{extracted.product_name}</span> from <span className="text-indigo-400 font-semibold">{extracted.vendor_name}</span>.
          </p>
        </div>
        <div className="text-xs text-gray-400 border border-white/10 bg-white/2 rounded-xl px-4 py-2 self-start md:self-auto">
          File: <span className="text-white font-mono">{activeQuote.filename}</span>
        </div>
      </div>

      {/* Main KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* KPI 1: Quote Total */}
        <motion.div 
          className="glass-panel rounded-2xl p-5 border border-white/5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quoted Total</span>
            <Tag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">${extracted.price.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            {extracted.quantity} {extracted.unit}s @ ${quotedUnitPrice.toLocaleString()}/{extracted.unit}
          </div>
        </motion.div>

        {/* KPI 2: Market Average */}
        <motion.div 
          className="glass-panel rounded-2xl p-5 border border-white/5"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Market Avg Total</span>
            <TrendingDown className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${(market_comparison.market_average * extracted.quantity).toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            Avg Benchmark: ${market_comparison.market_average.toLocaleString()}/{extracted.unit}
          </div>
        </motion.div>

        {/* KPI 3: Potential Savings */}
        <motion.div 
          className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Subtle neon glow for savings */}
          {market_comparison.savings_estimate > 0 && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Savings Opportunity</span>
            <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ${market_comparison.savings_estimate.toLocaleString()}
          </div>
          <div className={`text-[10px] mt-1 ${isOverpriced ? 'text-rose-400' : 'text-emerald-400/80'}`}>
            {isOverpriced 
              ? `${priceDiffPct}% overpriced (${absoluteDiff.toFixed(2)} above avg)` 
              : 'Below market average benchmark'}
          </div>
        </motion.div>

        {/* KPI 4: Risk Score */}
        <motion.div 
          className={`glass-panel rounded-2xl p-5 border ${getRiskColor(market_comparison.risk_score)}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Deal Risk Score</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black">{market_comparison.risk_score} / 100</div>
          <div className="text-[10px] font-semibold mt-1 opacity-80">
            {getRiskLevelLabel(market_comparison.risk_score)} ({market_comparison.vendor_risk} vendor risk)
          </div>
        </motion.div>

      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Extracted Terms (Left Column) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/5 flex-1">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Extracted Quote Terms</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Supplier Vendor</span>
                </div>
                <span className="text-xs font-semibold text-white">{extracted.vendor_name}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span>Product Category</span>
                </div>
                <span className="text-xs font-semibold text-white">{extracted.product_name}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <BadgeDollarSign className="w-4 h-4 text-cyan-400" />
                  <span>Quoted Unit Price</span>
                </div>
                <span className="text-xs font-semibold text-white">
                  ${quotedUnitPrice.toLocaleString()} / {extracted.unit}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span>Quoted Delivery Time</span>
                </div>
                <span className="text-xs font-semibold text-white">{extracted.delivery_time}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Payment Terms</span>
                </div>
                <span className="text-xs font-semibold text-white">{extracted.payment_terms}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Market Benchmark Data & Risk Scorecard (Right Column) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Market Benchmarks */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <TrendingDown className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">Market Benchmark (Local MCP)</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Market Price Range</span>
                <span className="text-white font-semibold">
                  ${market_comparison.market_min.toLocaleString()} - ${market_comparison.market_max.toLocaleString()} / {extracted.unit}
                </span>
              </div>

              {/* Range visualization slider */}
              <div className="relative w-full h-2 rounded-full bg-white/5 my-2">
                {/* Min/Max Marker */}
                <div className="absolute left-[15%] right-[15%] h-full bg-cyan-400/20 rounded-full" />
                {/* Average Marker */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                  style={{ left: '50%' }}
                  title={`Market Average: $${market_comparison.market_average}`}
                />
                {/* Quoted Price Marker */}
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${isOverpriced ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}
                  style={{ 
                    left: `${Math.min(95, Math.max(5, ((quotedUnitPrice - market_comparison.market_min) / (market_comparison.market_max - market_comparison.market_min)) * 70 + 15))}%` 
                  }}
                  title={`Quoted Unit Price: $${quotedUnitPrice}`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-gray-500 font-bold px-1">
                <span>MIN (${market_comparison.market_min})</span>
                <span className="text-indigo-400">AVG (${market_comparison.market_average})</span>
                <span>MAX (${market_comparison.market_max})</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Vendor Rating Score</span>
                </div>
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  {market_comparison.vendor_rating} / 5.0
                </span>
              </div>
            </div>
          </div>

          {/* Warning scorecard */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-[#0e1022]/40">
            <h4 className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Risk Scorecard Details
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs">
                <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-gray-400">Vendor Risk Profile:</span>
                <span className={`font-semibold ${market_comparison.vendor_risk === 'Low' ? 'text-emerald-400' : market_comparison.vendor_risk === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {market_comparison.vendor_risk}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-gray-400">Price Deviation:</span>
                <span className={`font-semibold ${isOverpriced ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isOverpriced ? `+${priceDiffPct}% above market avg` : 'Below market benchmark'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-gray-400">Negotiation Status:</span>
                <span className="text-white font-semibold">Active Strategies Available</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Action link block */}
      <motion.div 
        className="glass-panel rounded-3xl p-6 border border-white/5 bg-gradient-to-r from-cyan-950/20 to-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex-1">
          <h3 className="text-base font-bold text-white mb-1">Negotiate and Counteroffer</h3>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Ready to generate negotiation tactics? Review the customized strategy points created by the negotiation agent and retrieve the professional draft counteroffer email.
          </p>
        </div>
        <Link
          href="/negotiation"
          className="px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-sm tracking-wide text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto border border-white/10 shrink-0"
        >
          Enter Negotiation Center
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

    </div>
  );
}
