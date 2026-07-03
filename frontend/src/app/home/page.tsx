'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useVector } from '@/context/VectorContext';
import { Upload, FileText, Clipboard, ArrowRight, ShieldCheck, Cpu, Database, AlertCircle, User, Tag, BadgeDollarSign, Truck, Calendar, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const { uploadQuote, isLoading, error } = useVector();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New form fields state
  const [vendorName, setVendorName] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('units');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  const applyPreset = (preset: {
    vendor: string;
    product: string;
    price: string;
    quantity: string;
    unit: string;
    delivery: string;
    payment: string;
  }) => {
    setVendorName(preset.vendor);
    setProductName(preset.product);
    setPrice(preset.price);
    setQuantity(preset.quantity);
    setUnit(preset.unit);
    setDeliveryTime(preset.delivery);
    setPaymentTerms(preset.payment);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    
    if (activeTab === 'upload' && selectedFile) {
      success = await uploadQuote(selectedFile, null);
    } else if (activeTab === 'paste') {
      const formattedQuote = `Supplier: ${vendorName}
Product: ${productName}
Quantity: ${quantity} ${unit}
Total Price: $${price}
Delivery Time: ${deliveryTime}
Payment terms: ${paymentTerms}`;
      
      success = await uploadQuote(null, formattedQuote);
    }

    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-6 md:py-12">
      
      {/* Background glow decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center mb-12 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-sans font-black text-4xl md:text-6xl tracking-tight leading-tight mb-4">
            Maximize Savings with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
              VECTOR
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-sm md:text-base leading-relaxed">
            The intelligent AI procurement negotiation assistant. Upload supplier quotes, cross-reference market averages, analyze risks, and generate counteroffers offline.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload form container */}
        <motion.div 
          className="lg:col-span-7 glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Tab selector */}
          <div className="flex border-b border-white/10 mb-6 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Quote File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'paste'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Clipboard className="w-4 h-4" />
              Fill Quote Details
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {activeTab === 'upload' ? (
                <motion.div
                  key="upload-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
                      dragActive
                        ? 'border-cyan-400 bg-cyan-500/5'
                        : selectedFile
                        ? 'border-indigo-500/55 bg-indigo-500/5'
                        : 'border-white/10 bg-white/2 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".txt,.pdf"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                      <FileText className={`w-6 h-6 ${selectedFile ? 'text-indigo-400' : 'text-cyan-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white">
                        {selectedFile ? selectedFile.name : 'Select or drag supplier quote'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports PDF and plain text documents (.pdf, .txt)
                      </p>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl flex items-center justify-between">
                      <span>Selected: {(selectedFile.size / 1024).toFixed(1)} KB</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-gray-400 hover:text-white underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="paste-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  {/* Presets Row */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Presets (Quick Test)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyPreset({
                          vendor: 'Apex Solutions',
                          product: 'Stainless Steel Pipes',
                          price: '210000',
                          quantity: '100',
                          unit: 'meters',
                          delivery: '12 working days',
                          payment: 'Immediate'
                        })}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition-all cursor-pointer"
                      >
                        Apex Steel Pipes
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset({
                          vendor: 'Global Tech',
                          product: 'Plastic Granules',
                          price: '13200',
                          quantity: '100',
                          unit: 'tons',
                          delivery: '8 working days',
                          payment: 'Net 30'
                        })}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition-all cursor-pointer"
                      >
                        Global Plastic Granules
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset({
                          vendor: 'Nova Corp',
                          product: 'Microcontrollers',
                          price: '420000',
                          quantity: '100',
                          unit: 'units',
                          delivery: '18 working days',
                          payment: 'Net 60'
                        })}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all cursor-pointer"
                      >
                        Nova Microcontrollers
                      </button>
                    </div>
                  </div>

                  {/* Input Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Supplier */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400" /> Supplier Vendor
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Solutions"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                        required
                      />
                    </div>

                    {/* Product */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-cyan-400" /> Product Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Stainless Steel Pipes"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeDollarSign className="w-3.5 h-3.5 text-cyan-400" /> Total Quoted Price ($)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 210000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" /> Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                    </div>

                    {/* Unit */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" /> Unit of Measure
                      </label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                      >
                        <option value="units">units</option>
                        <option value="meters">meters</option>
                        <option value="tons">tons</option>
                        <option value="hours">hours</option>
                        <option value="months">months</option>
                      </select>
                    </div>

                    {/* Delivery Time */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-cyan-400" /> Delivery Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12 working days"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                        required
                      />
                    </div>

                    {/* Payment Terms */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Payment Terms
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Net 30, Net 60, Immediate Payment"
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#070915] p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'paste' && (!vendorName || !productName || !price || !quantity || !deliveryTime || !paymentTerms))}
              className="relative w-full py-4 rounded-2xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 disabled:pointer-events-none hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              Analyze Supplier Quote
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Loading state animation */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#080b18]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-white text-sm tracking-wide">Multi-Agent Processing...</p>
                <p className="text-xs text-gray-400 mt-1">Invoking Quote Analyzer, checking MCP prices & evaluating terms...</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Feature breakdown side list */}
        <motion.div 
          className="lg:col-span-5 flex flex-col gap-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="p-1 px-4 rounded-xl border border-white/5 bg-white/2">
            <h3 className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase py-2">
              Core Procurement Features
            </h3>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-slate-950/20">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">1. Quote Term Extraction</h4>
              <p className="text-xs text-gray-400 mt-1">
                Extracts critical terms including unit prices, quantities, delivery lead times, and payment windows from uploaded documents or raw text.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-slate-950/20">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">2. Market Price Benchmarking</h4>
              <p className="text-xs text-gray-400 mt-1">
                Compares supplier quotes with regional industry averages and vendor safety rating benchmarks retrieved dynamically from an offline database.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-slate-950/20">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">3. Intelligent Negotiation Center</h4>
              <p className="text-xs text-gray-400 mt-1">
                Generates strategic target targets, vendor risk alerts, and compiles complete, professional counteroffer emails ready for outreach.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
