import React, { useState, useEffect } from 'react';
import { Scheme, ControllerStatusResponse, UserProfile } from '../../types/orchestrator.js';
import { fetchSchemes, searchSchemes } from '../../services/api.js';
import {
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  WifiOff,
  Cpu,
  Database
} from 'lucide-react';
import { offlineSyncEngine } from '../../services/offlineSyncEngine.js';

interface SchemeSearchPageProps {
  status: ControllerStatusResponse | null;
  onSelectScheme: (scheme: Scheme) => void;
  userProfile?: UserProfile;
  isLightMode?: boolean;
}

export const SchemeSearchPage: React.FC<SchemeSearchPageProps> = ({
  status,
  onSelectScheme,
  userProfile,
  isLightMode = false
}) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(offlineSyncEngine.isOffline());

  useEffect(() => {
    return offlineSyncEngine.onNetworkChange((offline) => {
      setIsOffline(offline);
      loadSchemes(offline);
    });
  }, [selectedCategory, selectedState]);

  const loadSchemes = async (offline = isOffline) => {
    setIsLoading(true);

    if (offline) {
      // 1. LOCAL DATABASE & CACHE
      const localResults = offlineSyncEngine.searchSchemesOffline(
        searchQuery,
        selectedCategory,
        selectedState
      );
      setSchemes(localResults);
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchSchemes({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        search: searchQuery || undefined
      });
      setSchemes(data);
      // Cache fresh schemes into IndexedDB/LocalStorage
      offlineSyncEngine.updateCachedSchemesDelta(data);
    } catch (err) {
      console.warn('Network fetch failed; falling back to local cached schemes:', err);
      const fallback = offlineSyncEngine.searchSchemesOffline(searchQuery, selectedCategory, selectedState);
      setSchemes(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, [selectedCategory, selectedState]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isOffline) {
      const localResults = offlineSyncEngine.searchSchemesOffline(
        searchQuery,
        selectedCategory,
        selectedState
      );
      setSchemes(localResults);
      setIsLoading(false);
      return;
    }

    try {
      const result = await searchSchemes(searchQuery, userProfile);
      setSchemes(result.schemes || []);
    } catch (err) {
      const fallback = offlineSyncEngine.searchSchemesOffline(searchQuery, selectedCategory, selectedState);
      setSchemes(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const schemeAgent = status?.active_workflows?.[0]?.agents?.['scheme_discovery_agent'];
  const cacheMeta = offlineSyncEngine.getCacheMetadata();

  const categories = [
    'All',
    'Agriculture & Farmers',
    'Small Business & Entrepreneurship',
    'Students & Education',
    'Women & Child Development',
    'Senior Citizens & Social Welfare',
    'Rural Housing & Welfare'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Offline Alert or Agent 2 Telemetry */}
      {isOffline ? (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 shrink-0">
              <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Offline Discovery Engine Active
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold">
                  {cacheMeta.freshnessLabel}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Searching {schemes.length} statutory welfare schemes stored in your local browser cache (v{cacheMeta.version}).
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <Database className="w-4 h-4 text-amber-600" />
            <span>Local DB: <b>Active</b></span>
          </div>
        </div>
      ) : schemeAgent ? (
        <div className={`rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLightMode ? 'bg-sky-50 border-sky-200 text-slate-800' : 'bg-sky-500/10 border-sky-500/30 text-slate-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Scheme Discovery Agent Active
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-bold">
                  Tool: Vector DB + LLM
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{schemeAgent.current_task}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span>Prompt: <b className="text-emerald-600">890 tk</b></span>
            <span>Comp: <b className="text-sky-500">340 tk</b></span>
            <span>Cost: <b className="text-amber-500">~₹0.04</b></span>
          </div>
        </div>
      ) : null}

      {/* Search & Filter Controls */}
      <div className={`p-6 rounded-2xl border shadow-sm transition-colors ${
        isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
      }`}>
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by welfare need, crop subsidy, student loan, pension..."
              className={`w-full pl-12 pr-28 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                isLightMode
                  ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-800/60 border-slate-700 text-slate-100 placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : isLightMode
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((scheme) => (
          <div
            key={scheme.scheme_id}
            className={`p-5 rounded-2xl border transition-all hover:scale-[1.005] flex flex-col justify-between ${
              isLightMode
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {scheme.category}
                </span>
                <span className={`text-[10px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {scheme.state}
                </span>
              </div>

              <h3 className={`font-bold text-base mt-2.5 line-clamp-1 ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                {scheme.name}
              </h3>

              <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                {scheme.description}
              </p>

              <div className={`mt-3 p-2.5 rounded-xl border text-xs ${
                isLightMode ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800/40 border-slate-800 text-slate-300'
              }`}>
                <b className="text-emerald-600">Benefits: </b>
                {scheme.benefits}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {scheme.required_documents.length} Docs Required
              </span>

              <button
                onClick={() => onSelectScheme(scheme)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
              >
                <span>Check Eligibility</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
