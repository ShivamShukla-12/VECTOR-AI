'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ExtractedData {
  product_name: string;
  vendor_name: string;
  price: number;
  quantity: number;
  unit: string;
  delivery_time: string;
  payment_terms: string;
}

export interface MarketComparison {
  market_average: number;
  market_min: number;
  market_max: number;
  vendor_rating: number;
  vendor_risk: string;
  savings_estimate: number;
  price_variance_pct: number;
  risk_score: number;
}

export interface NegotiationData {
  strategy: string[];
  counteroffer_email: string;
  final_recommendation: string;
}

export interface QuoteAnalysis {
  id: number;
  created_at: string;
  filename: string;
  raw_text: string;
  extracted: ExtractedData;
  market_comparison: MarketComparison;
  negotiation: NegotiationData;
}

interface VectorContextType {
  history: QuoteAnalysis[];
  activeQuote: QuoteAnalysis | null;
  isLoading: boolean;
  error: string | null;
  setActiveQuote: (quote: QuoteAnalysis | null) => void;
  setActiveQuoteById: (id: number) => void;
  uploadQuote: (file: File | null, pastedText: string | null) => Promise<boolean>;
  deleteQuote: (id: number) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

const VectorContext = createContext<VectorContextType | undefined>(undefined);

export function VectorProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<QuoteAnalysis[]>([]);
  const [activeQuote, setActiveQuote] = useState<QuoteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quotes`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        // If there is history and no active quote is set, select the latest one
        if (data.length > 0 && !activeQuote) {
          setActiveQuote(data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching quote history from backend:', e);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveQuoteById = (id: number) => {
    const found = history.find(q => q.id === id);
    if (found) {
      setActiveQuote(found);
    }
  };

  const uploadQuote = async (file: File | null, pastedText: string | null): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (pastedText) {
        formData.append('pasted_text', pastedText);
      } else {
        throw new Error('No supplier quote content provided.');
      }

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Quote analysis failed.');
      }

      const result: QuoteAnalysis = await res.json();
      setActiveQuote(result);
      setHistory(prev => [result, ...prev.filter(q => q.id !== result.id)]);
      return true;
    } catch (e) {
      console.error('Upload quote error:', e);
      const errMessage = e instanceof Error ? e.message : 'An unexpected error occurred while communicating with the backend.';
      setError(errMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuote = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/quotes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory(prev => prev.filter(q => q.id !== id));
        if (activeQuote?.id === id) {
          const remaining = history.filter(q => q.id !== id);
          setActiveQuote(remaining.length > 0 ? remaining[0] : null);
        }
      } else {
        console.error('Failed to delete record');
      }
    } catch (e) {
      console.error('Error deleting record:', e);
    }
  };

  return (
    <VectorContext.Provider value={{
      history,
      activeQuote,
      isLoading,
      error,
      setActiveQuote,
      setActiveQuoteById,
      uploadQuote,
      deleteQuote,
      fetchHistory,
    }}>
      {children}
    </VectorContext.Provider>
  );
}

export function useVector() {
  const context = useContext(VectorContext);
  if (!context) {
    throw new Error('useVector must be used within a VectorProvider');
  }
  return context;
}
