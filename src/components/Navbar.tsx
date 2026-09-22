import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Activity,
  Layers,
  Cpu,
  Users,
  Search,
  FileText,
  Languages,
  BarChart3,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  Trophy,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Type,
  RefreshCw,
  Bell,
  Flame,
  Shield,
  User
} from 'lucide-react';
import { startConcurrencyDemo, resetDemo, runScenario } from '../services/api.js';
import { offlineSyncEngine } from '../services/offlineSyncEngine.js';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isConnected: boolean;
  onOpenTests: () => void;
  onOpenJudgeDeck?: () => void;
  activeWorkflowsCount: number;
  isLightMode: boolean;
  setIsLightMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isElderlyFont: boolean;
  setIsElderlyFont: (val: boolean | ((prev: boolean) => boolean)) => void;
  currentCitizenName?: string;
  currentAgentName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isConnected,
  onOpenTests,
  onOpenJudgeDeck,
  activeWorkflowsCount,
  isLightMode,
  setIsLightMode,
  isElderlyFont,
  setIsElderlyFont,
  currentCitizenName,
  currentAgentName
}) => {
  const [isDemoStarting, setIsDemoStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false);

  // Offline Engine State
  const [isOffline, setIsOffline] = useState(offlineSyncEngine.isOffline());
  const [pendingSyncCount, setPendingSyncCount] = useState(offlineSyncEngine.getPendingQueueCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [recoveryToast, setRecoveryToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubNet = offlineSyncEngine.onNetworkChange(setIsOffline);
    const unsubQueue = offlineSyncEngine.onQueueChange(setPendingSyncCount);
    return () => {
      unsubNet();
      unsubQueue();
    };
  }, []);

  const handleToggleSimulatedOffline = () => {
    const newStatus = offlineSyncEngine.toggleSimulatedOffline();
    setIsOffline(newStatus);
  };

  const handleManualSync = async () => {
    if (isOffline) {
      alert('Network is currently disconnected. Reconnect network to sync pending applications to cloud.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await offlineSyncEngine.syncPendingData();
      if (res.syncedCount > 0) {
        setRecoveryToast(res.message);
        setTimeout(() => setRecoveryToast(null), 6000);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartDemo = async () => {
    setIsDemoStarting(true);
    try {
      await startConcurrencyDemo();
      setActiveTab('control-center');
    } catch (e) {
      console.error(e);
    } finally {
      setIsDemoStarting(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemo();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const handleRunScenario = async (id: 'A' | 'B' | 'C' | 'D' | 'E') => {
    setScenarioMenuOpen(false);
    try {
      await runScenario(id);
      setActiveTab('control-center');
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'profile', label: 'Citizen Profile & OTP', icon: Users, badge: 'e-KYC' },
    { id: 'resource-contention', label: 'AI Tool Contention', icon: Flame, badge: 'LLM/GPU' },
    { id: 'control-center', label: 'A3 Control Center', icon: Cpu, badge: 'Core' },
    { id: 'service-graph', label: 'Service Graph', icon: Layers },
    { id: 'agents', label: '6 Agents', icon: Activity, badge: activeWorkflowsCount > 0 ? `${activeWorkflowsCount} live` : undefined },
    { id: 'schemes', label: 'Scheme Discovery', icon: Search },
    { id: 'eligibility', label: 'Eligibility', icon: CheckCircle2 },
    { id: 'documents', label: 'Document Intel', icon: FileText },
    { id: 'application', label: 'Application Draft', icon: FileText },
    { id: 'vernacular', label: 'Vernacular AI', icon: Languages },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors backdrop-blur ${
      isLightMode
        ? 'border-slate-200 bg-white/95 text-slate-900 shadow-sm'
        : 'border-slate-800 bg-slate-950/90 text-slate-100'
    }`}>
      {/* Recovery Toast Banner */}
      {recoveryToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center space-x-2 shadow-md animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4" />
          <span>{recoveryToast}</span>
        </div>
      )}

      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
              isLightMode ? 'bg-white' : 'bg-slate-950'
            }`}>
              <Cpu className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-black text-lg tracking-tight ${
                isLightMode ? 'text-slate-900' : 'text-slate-100'
              }`}>
                SCHEMESEVA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                Offline-First A3 Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Welfare Scheme Access for Rural & Intermittent Connectivity
            </p>
          </div>
        </div>

        {/* Prominent Citizen & Agent Identity Ribbon */}
        <div
          onClick={() => setActiveTab('profile')}
          className={`hidden xl:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border cursor-pointer transition-all shadow-xs ${
            isLightMode
              ? 'bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-200 text-slate-800'
              : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/50 text-slate-200'
          }`}
          title="Click to view citizen profile & verify credentials"
        >
          <div className="flex items-center space-x-1.5 text-xs">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500 font-medium">Citizen:</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
              {currentCitizenName || 'Rajesh Kumar'}
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-xs">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-500 font-medium">Agent:</span>
            <span className="font-extrabold text-sky-700 dark:text-sky-300 truncate max-w-[130px]">
              {currentAgentName ? currentAgentName.split('(')[0].trim() : 'Agent Vikram Sharma'}
            </span>
          </div>
        </div>

        {/* Center/Right Evaluator & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* 5. Evaluator "A3 Disconnect Demo" UI Toggle */}
          <button
            id="evaluator-disconnect-toggle"
            onClick={handleToggleSimulatedOffline}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              isOffline
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 animate-pulse'
                : isLightMode
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Evaluator Proof: Toggle Network Disconnect to test Local AI Rules Agent"
          >
            {isOffline ? (
              <>
                <WifiOff className="w-4 h-4 text-slate-950" />
                <span className="font-mono">Offline Mode (Local Agent Active)</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span className="hidden md:inline font-mono">Simulate Network Disconnect</span>
                <span className="md:hidden font-mono">Simulate Offline</span>
              </>
            )}
          </button>

          {/* Pending Sync Badge */}
          {pendingSyncCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isOffline || isSyncing}
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 border transition-all ${
                isOffline
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer animate-pulse'
              }`}
              title={isOffline ? 'Syncs automatically when network reconnects' : 'Click to Sync Now to Cloud'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Pending Sync: {pendingSyncCount}</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle (Elderly Accessibility) */}
          <button
            onClick={() => setIsLightMode(prev => !prev)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-300'
            }`}
            title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Clean Light Mode (Recommended for Elderly)'}
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Elderly Text Size Toggle (A+ / A-) */}
          <button
            onClick={() => setIsElderlyFont(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isElderlyFont
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isLightMode
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title={isElderlyFont ? 'Standard Text Size' : 'Large Text Size (Elderly Mode)'}
          >
            <span className="font-mono">{isElderlyFont ? 'A-' : 'A+'}</span>
          </button>

          {/* Judge Showcase Pitch Deck Trigger */}
          {onOpenJudgeDeck && (
            <button
              onClick={onOpenJudgeDeck}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Open Hackathon Judge Benchmark Deck"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Judge Deck</span>
            </button>
          )}

          {/* Test Suite Trigger */}
          <button
            onClick={onOpenTests}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
            title="Run 12/12 Automated Invariant Tests"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Run Tests</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className={`border-t overflow-x-auto scrollbar-none ${
        isLightMode ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800/80 bg-slate-950/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold'
                    : isLightMode
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
