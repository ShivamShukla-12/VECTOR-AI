'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVector } from '@/context/VectorContext';
import { Shield, ChevronDown, Trash2, History, Settings } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { history, activeQuote, setActiveQuoteById, deleteQuote } = useVector();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Hide Navbar completely on the Splash Welcome Page
  if (pathname === '/') return null;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080b18]/60 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-all">
            <Shield className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
              VECTOR
            </span>
            <span className="text-[10px] text-gray-400 tracking-widest uppercase">
              AI Procurement
            </span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/home"
            className={`font-medium text-sm transition-all hover:text-cyan-400 ${
              isActive('/home') ? 'text-cyan-400' : 'text-gray-300'
            }`}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`font-medium text-sm transition-all hover:text-cyan-400 ${
              isActive('/dashboard') ? 'text-cyan-400' : 'text-gray-300'
            } ${!activeQuote ? 'pointer-events-none opacity-50' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            href="/negotiation"
            className={`font-medium text-sm transition-all hover:text-cyan-400 ${
              isActive('/negotiation') ? 'text-cyan-400' : 'text-gray-300'
            } ${!activeQuote ? 'pointer-events-none opacity-50' : ''}`}
          >
            Negotiation Center
          </Link>
        </div>

        {/* History Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white/90 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer select-none"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>
              {activeQuote 
                ? activeQuote.extracted.vendor_name.length > 15 
                  ? activeQuote.extracted.vendor_name.slice(0, 15) + '...' 
                  : activeQuote.extracted.vendor_name
                : 'No Quotes'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#0c1023]/95 backdrop-blur-lg p-2 shadow-2xl z-50">
              <div className="px-3 py-2 text-[10px] text-gray-400 tracking-wider uppercase font-bold border-b border-white/5">
                Quote History ({history.length})
              </div>
              <div className="max-h-64 overflow-y-auto mt-1 flex flex-col gap-1 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {history.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500">
                    No quotes analyzed yet.
                  </div>
                ) : (
                  history.map((q) => (
                    <div
                      key={q.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                        activeQuote?.id === q.id 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 border border-cyan-500/30' 
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setActiveQuoteById(q.id);
                          setDropdownOpen(false);
                        }}
                        className="flex-1 flex flex-col text-left mr-2"
                      >
                        <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                          {q.extracted.vendor_name || 'Unknown Vendor'}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[180px]">
                          {q.extracted.product_name || 'Product'} | {q.filename}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuote(q.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                        title="Delete quote analysis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
      </nav>

      {/* Floating Settings Button in the bottom-right corner */}
      <Link
        href="/settings"
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-[#0c1023]/80 backdrop-blur-md shadow-lg group hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 ${
          isActive('/settings') ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' : 'text-gray-300'
        }`}
        title="Settings"
      >
        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500 ease-out" />
      </Link>
    </>
  );
}
