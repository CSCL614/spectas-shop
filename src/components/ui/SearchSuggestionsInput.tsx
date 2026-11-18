import React, { useState, useEffect, useRef, useMemo } from 'react';
import { salesApi } from '../../api/services';
import type { SearchSuggestionItem } from '../../types';
import {
  Search,
  User,
  Phone,
  Tag,
  Glasses,
  Hash,
  Compass,
  X,
  Loader2,
  CornerDownLeft,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchSuggestionsInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (item: SearchSuggestionItem) => void;
  onSubmitSearch?: () => void;
  isAdmin?: boolean;
  salespersonId?: string;
  placeholder?: string;
  className?: string;
}

const NAV_PAGES: { label: string; sublabel: string; route: string; keywords: string[]; adminOnly?: boolean }[] = [
  { label: 'Dashboard Overview', sublabel: 'Navigate to Executive Dashboard', route: '/dashboard', keywords: ['dashboard', 'home', 'overview', 'kpi', 'analytics'] },
  { label: 'New Order Entry', sublabel: 'Create a new optical customer order', route: '/sales/new', keywords: ['new', 'create', 'order', 'entry', 'add', 'sale'] },
  { label: 'Daily Statement', sublabel: 'Daily financial statement & PDF report', route: '/daily-statement', keywords: ['daily', 'statement', 'report', 'pdf', 'reconciliation'] },
  { label: 'Bulk Excel Import', sublabel: 'Upload Excel orders to Vercel Blob & MongoDB', route: '/excel/import', keywords: ['excel', 'import', 'upload', 'bulk', 'sheet'] },
  { label: 'Filtered Excel Export', sublabel: 'Export filtered orders to Excel', route: '/excel/export', keywords: ['excel', 'export', 'download', 'spreadsheet'] },
  { label: 'Excel Sheets Vault', sublabel: 'Manage & download uploaded Excel sheets', route: '/admin/excel-sheets', keywords: ['excel', 'sheets', 'vault', 'archive', 'blob'], adminOnly: true },
  { label: 'Business Intelligence', sublabel: 'Deep sales & profit analytics reports', route: '/reports', keywords: ['reports', 'business', 'intelligence', 'bi', 'profit'], adminOnly: true },
  { label: 'Admin & Accounts', sublabel: 'Manage Admin & Sales Executive accounts', route: '/admin/users', keywords: ['users', 'accounts', 'staff', 'salesperson', 'admin', 'executive'], adminOnly: true },
  { label: 'Audit Trails', sublabel: 'System activity & security logs', route: '/admin/audit-logs', keywords: ['audit', 'logs', 'history', 'trails', 'security'], adminOnly: true },
  { label: 'Profile & Security', sublabel: 'Account profile & password settings', route: '/profile', keywords: ['profile', 'password', 'security', 'settings'] },
];

const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="bg-blue-100 text-[#1D4ED8] font-black rounded px-0.5 not-italic"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

const getTypeMeta = (type: SearchSuggestionItem['type']) => {
  switch (type) {
    case 'customer':
      return {
        Icon: User,
        bg: 'bg-blue-50 text-[#2563EB] border-blue-200',
        pill: 'Customer',
      };
    case 'phone':
      return {
        Icon: Phone,
        bg: 'bg-teal-50 text-[#0D9488] border-teal-200',
        pill: 'Phone',
      };
    case 'sticker':
      return {
        Icon: Tag,
        bg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        pill: 'Sticker',
      };
    case 'brand':
      return {
        Icon: Glasses,
        bg: 'bg-violet-50 text-violet-600 border-violet-200',
        pill: 'Brand',
      };
    case 'order':
      return {
        Icon: Hash,
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        pill: 'Order ID',
      };
    case 'page':
    default:
      return {
        Icon: Compass,
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        pill: 'Page',
      };
  }
};

export const SearchSuggestionsInput: React.FC<SearchSuggestionsInputProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  onSubmitSearch,
  isAdmin = false,
  salespersonId = '',
  placeholder = 'Search STK-1016, customer, phone, brand, order ID, or page...',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const requestSeqRef = useRef(0);

  // Local navigation page matches (only when typing or Admin)
  const pageSuggestions = useMemo<SearchSuggestionItem[]>(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return NAV_PAGES.filter((p) => {
      if (p.adminOnly && !isAdmin) return false;
      return (
        p.label.toLowerCase().includes(q) ||
        p.sublabel.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.includes(q))
      );
    })
      .slice(0, 3)
      .map((p) => ({
        id: `page-${p.route}`,
        type: 'page',
        label: p.label,
        sublabel: p.sublabel,
        value: p.label,
        route: p.route,
      }));
  }, [value, isAdmin]);

  const combinedSuggestions = useMemo(() => {
    return [...apiSuggestions, ...pageSuggestions];
  }, [apiSuggestions, pageSuggestions]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API fetch while open
  useEffect(() => {
    if (!open) return;

    const seq = ++requestSeqRef.current;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await salesApi.getSearchSuggestions(
          value.trim(),
          isAdmin ? salespersonId || undefined : undefined
        );
        if (requestSeqRef.current === seq) {
          setApiSuggestions(res.data.data || []);
          setActiveIndex(-1);
        }
      } catch {
        if (requestSeqRef.current === seq) {
          setApiSuggestions([]);
        }
      } finally {
        if (requestSeqRef.current === seq) {
          setLoading(false);
        }
      }
    }, value.trim() ? 220 : 60);

    return () => window.clearTimeout(timer);
  }, [value, open, isAdmin, salespersonId]);

  // Keep active keyboard-selected item scrolled into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-suggestion-idx="${activeIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSelect = (item: SearchSuggestionItem) => {
    setOpen(false);
    setActiveIndex(-1);
    onSelectSuggestion(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (combinedSuggestions.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % combinedSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (combinedSuggestions.length === 0) return;
      setActiveIndex((prev) => (prev <= 0 ? combinedSuggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && activeIndex < combinedSuggestions.length) {
        e.preventDefault();
        handleSelect(combinedSuggestions[activeIndex]);
      } else {
        setOpen(false);
        onSubmitSearch?.();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={value}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          className="input-modern pl-10 pr-10"
        />

        {loading ? (
          <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setActiveIndex(-1);
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Intelligent Suggestions Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.985 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border-[1.5px] border-[#CFDCEB] shadow-[0_18px_40px_-10px_rgba(15,23,42,0.22)] overflow-hidden"
          >
            {/* Header Strip */}
            <div className="px-3.5 py-2 bg-gradient-to-r from-[#EEF3FA] via-[#F8FAFC] to-[#E7F5F4] border-b border-[#D5DFED] flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <span>
                {value.trim()
                  ? `Smart Matches for "${value.trim()}"`
                  : 'Quick Suggestions — Recent Orders, Customers & Brands'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                <ArrowUpDown className="w-3 h-3" />
                <span>Navigate</span>
              </span>
            </div>

            {/* Suggestions List */}
            <div ref={listRef} className="max-h-72 overflow-y-auto divide-y divide-[#EEF2F8]">
              {loading && combinedSuggestions.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                  <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
                  <span className="font-semibold">Searching orders, customers & brands...</span>
                </div>
              ) : combinedSuggestions.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <Search className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-black text-[#172554]">No matching suggestions found</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Try searching by sticker number (e.g. STK-1016), customer name, 10-digit mobile, brand, or Order ID.
                  </p>
                </div>
              ) : (
                combinedSuggestions.map((item, idx) => {
                  const { Icon, bg, pill } = getTypeMeta(item.type);
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-suggestion-idx={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleSelect(item)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                        isActive
                          ? 'bg-blue-50/95'
                          : 'hover:bg-[#F8FAFE]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#172554] truncate">
                            <HighlightText text={item.label} query={value} />
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            <HighlightText text={item.sublabel} query={value} />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline">
                            {item.badge}
                          </span>
                        )}
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${bg}`}>
                          {pill}
                        </span>
                        {isActive && <CornerDownLeft className="w-3.5 h-3.5 text-[#2563EB]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Hints */}
            <div className="px-3.5 py-1.5 bg-[#F8FAFC] border-t border-[#E2E9F3] flex items-center justify-between text-[10px] text-slate-400 font-semibold">
              <span>Press Enter to select or search table</span>
              <span>Esc to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

