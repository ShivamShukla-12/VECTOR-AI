'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2, Database, BadgeDollarSign, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Benchmark {
  market_price: number;
  supplier_rating: number;
}

interface BenchmarksMap {
  [key: string]: Benchmark;
}

export default function SettingsPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarksMap>({});
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newRating, setNewRating] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // General Settings state
  const [apiLocation, setApiLocation] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
  const dbLocation = 'vector_procurement.db (SQLite Local)';
  const [strategyFocus, setStrategyFocus] = useState('balanced');
  const [targetSavingsPct, setTargetSavingsPct] = useState('10');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const fetchBenchmarks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/benchmarks`);
      if (!res.ok) {
        throw new Error('Failed to load benchmarks from backend.');
      }
      const data = await res.json();
      setBenchmarks(data);
    } catch (e) {
      console.error(e);
      const errMessage = e instanceof Error ? e.message : 'Could not connect to the backend server.';
      setError(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBenchmarks();
  }, []);

  const handleBenchmarkChange = (category: string, field: keyof Benchmark, value: number) => {
    setBenchmarks(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleDeleteCategory = (category: string) => {
    const updated = { ...benchmarks };
    delete updated[category];
    setBenchmarks(updated);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || !newPrice || !newRating) {
      setError('Please fill in all benchmark fields.');
      return;
    }

    const priceNum = parseFloat(newPrice);
    const ratingNum = parseInt(newRating);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Market price must be a positive number.');
      return;
    }

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 100) {
      setError('Supplier rating must be between 1 and 100.');
      return;
    }

    const capitalizedCategory = newCategory
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    if (benchmarks[capitalizedCategory]) {
      setError('Category already exists.');
      return;
    }

    setBenchmarks(prev => ({
      ...prev,
      [capitalizedCategory]: {
        market_price: priceNum,
        supplier_rating: ratingNum
      }
    }));

    setNewCategory('');
    setNewPrice('');
    setNewRating('');
    setError(null);
    setSuccessMessage(`Added category "${capitalizedCategory}" to list. Click Save Changes to commit.`);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/benchmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(benchmarks)
      });

      if (!res.ok) {
        throw new Error('Failed to save benchmarks back to benchmarks.json.');
      }

      setSuccessMessage('Settings and pricing benchmarks updated successfully!');
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (e) {
      console.error(e);
      const errMessage = e instanceof Error ? e.message : 'Failed to sync modifications with the backend server.';
      setError(errMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-6 md:py-12">
      {/* Background glow decorations */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3 tracking-wide uppercase">
            <Settings className="w-3.5 h-3.5" /> Operations Control
          </div>
          <h1 className="font-sans font-black text-3xl md:text-5xl tracking-tight leading-tight mb-2 text-white">
            System Settings
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Configure target metrics, database details, and pricing benchmarks used by the local MCP server for negotiation comparisons.
          </p>
        </div>

        <button
          onClick={handleSaveChanges}
          disabled={isLoading || isSaving}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 border border-white/10 shrink-0 cursor-pointer"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Syncing...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Status Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs mb-6 relative z-10"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs mb-6 relative z-10"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Side: General System Settings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="text-sm font-bold text-white tracking-wide mb-6 pb-3 border-b border-white/5 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-cyan-400" /> Infrastructure
            </h3>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">FastAPI API Host</span>
                <input
                  type="text"
                  value={apiLocation}
                  onChange={(e) => setApiLocation(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Storage Engine</span>
                <input
                  type="text"
                  value={dbLocation}
                  disabled
                  className="w-full rounded-xl border border-white/5 bg-[#070915]/50 p-3 text-xs text-gray-500 font-mono pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="text-sm font-bold text-white tracking-wide mb-6 pb-3 border-b border-white/5 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-indigo-400" /> Negotiation Focus
            </h3>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tactic Bias</span>
                <div className="grid grid-cols-3 gap-2">
                  {['aggressive', 'balanced', 'cooperative'].map((focus) => (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => setStrategyFocus(focus)}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                        strategyFocus === focus
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-white/10 bg-white/2 text-gray-400 hover:text-white'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Default Target discount (%)</span>
                <input
                  type="number"
                  value={targetSavingsPct}
                  onChange={(e) => setTargetSavingsPct(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Benchmark Lists & Pricing Form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* List Benchmarks */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="text-sm font-bold text-white tracking-wide mb-6 pb-3 border-b border-white/5 flex items-center gap-2">
              <BadgeDollarSign className="w-4.5 h-4.5 text-emerald-400" /> Pricing Benchmarks
            </h3>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                <span className="text-xs text-gray-400">Loading local index benchmarks...</span>
              </div>
            ) : Object.keys(benchmarks).length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                No active pricing benchmarks configured. Use the form below to add one.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {Object.entries(benchmarks).map(([category, details]) => (
                  <div 
                    key={category}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-all"
                  >
                    <div className="flex-1 min-w-[150px]">
                      <h4 className="text-sm font-bold text-white">{category}</h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Product Category</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      {/* Price input */}
                      <div className="flex flex-col gap-1.5 w-32">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Avg Market Rate ($)</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                          <input
                            type="number"
                            value={details.market_price}
                            onChange={(e) => handleBenchmarkChange(category, 'market_price', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-xl border border-white/10 bg-[#070915] pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-mono"
                          />
                        </div>
                      </div>

                      {/* Supplier rating input */}
                      <div className="flex flex-col gap-1.5 w-28">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Avg Supplier Rating (1-100)</span>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={details.supplier_rating}
                            onChange={(e) => handleBenchmarkChange(category, 'supplier_rating', parseInt(e.target.value) || 0)}
                            className="w-full rounded-xl border border-white/10 bg-[#070915] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-mono"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all self-end md:self-auto cursor-pointer"
                        title="Delete benchmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Benchmark Form */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-[#0e1022]/30">
            <h3 className="text-sm font-bold text-white tracking-wide mb-6 pb-3 border-b border-white/5 flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-cyan-400" /> Create Custom Benchmark
            </h3>

            <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Category</label>
                <input
                  type="text"
                  placeholder="e.g. Copper Cables"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Market Price ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quality Score (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 85"
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <button
                type="submit"
                className="md:col-span-3 w-full py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Benchmark to List</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
