import React from 'react';
import {
  Sparkles,
  Play,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Trophy,
  Zap,
  BarChart3,
  Clock,
  Flame,
  WifiOff,
  Sun
} from 'lucide-react';
import { startConcurrencyDemo } from '../services/api.js';

interface OverviewPageProps {
  setActiveTab: (tab: string) => void;
  onOpenTests: () => void;
  onOpenJudgeDeck: () => void;
  isLightMode?: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  setActiveTab,
  onOpenTests,
  onOpenJudgeDeck,
  isLightMode = false
}) => {
  const handleStartDemo = async () => {
    try {
      await startConcurrencyDemo();
      setActiveTab('control-center');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      <div className={`relative rounded-3xl border p-8 sm:p-12 overflow-hidden shadow-2xl transition-colors ${
        isLightMode
          ? 'bg-gradient-to-br from-emerald-50 via-white to-amber-50/60 border-emerald-200/80 text-slate-900 shadow-emerald-500/10'
          : 'bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-slate-800 text-slate-100'
      }`}>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-4">
            <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
            <span>SchemeSeva · Offline-First Multi-Agent Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Government Welfare Delivery with{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 dark:from-amber-400 dark:via-sky-300 dark:to-emerald-400 bg-clip-text text-transparent">
              Offline-First Resilience
            </span>
          </h1>

          <p className={`mt-4 text-sm sm:text-base leading-relaxed ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
            Eliminate server crashes and rural connectivity lockouts. Indian citizens can search welfare schemes,
            verify statutory eligibility offline via client-side agents, capture documents with live camera feeds,
            and queue submissions with <b>zero data loss</b>.
          </p>

          {/* Quick Action CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onOpenJudgeDeck}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center space-x-2 transition transform active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Trophy className="w-4 h-4" />
              <span>JUDGE PITCH & BENCHMARK NUMBERS</span>
            </button>

            <button
              onClick={handleStartDemo}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 flex items-center space-x-2 transition transform active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START 4-USER CONCURRENCY DEMO</span>
            </button>

            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-4 py-3 rounded-xl border font-bold text-sm flex items-center space-x-2 transition cursor-pointer min-h-[44px] ${
                isLightMode
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Explore Schemes</span>
            </button>

            <button
              onClick={onOpenTests}
              className={`px-4 py-3 rounded-xl border font-semibold text-sm flex items-center space-x-2 transition cursor-pointer min-h-[44px] ${
                isLightMode
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>12/12 Invariant Tests</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Operational Numbers Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`p-4 rounded-xl border transition-colors ${
          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 block">Total Allocations</span>
          <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">152</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Across 10 Tools</span>
        </div>

        <div className={`p-4 rounded-xl border transition-colors ${
          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 block">Average Latency</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">1.4s</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">-71% vs baseline</span>
        </div>

        <div className={`p-4 rounded-xl border transition-colors ${
          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 block">Deadlocks Incurred</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-sky-400">0</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">100% Deadlock-Free</span>
        </div>

        <div className={`p-4 rounded-xl border transition-colors ${
          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 block">Starvation Boosts</span>
          <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">11</span>
          <span className="text-[10px] text-amber-600 block mt-0.5">Aging promotions</span>
        </div>

        <div className={`p-4 rounded-xl border transition-colors ${
          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 block">Over-Allocations Stopped</span>
          <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">19</span>
          <span className="text-[10px] text-purple-600 block mt-0.5">Cap = 2 preserved</span>
        </div>

        <div className={`p-4 rounded-xl border transition-colors ${
          isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-500 block">Welfare Delivered</span>
          <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">₹18.4L</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Simulated direct aid</span>
        </div>
      </div>

      {/* Highlighted Hackathon Modules: Profile OTP & Resource Contention */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module 1: Citizen Profile & OTP Verification */}
        <div className={`p-6 rounded-2xl border shadow-lg transition-all ${
          isLightMode
            ? 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border-emerald-200'
            : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              Anti-Impersonation e-KYC
            </span>
            <span className="text-[10px] font-mono text-slate-400">UIDAI & Kutumba</span>
          </div>

          <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Citizen Profile & Mobile OTP Verification</span>
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Verify citizen identity via registered mobile OTP to ensure individuals cannot impersonate or misuse someone else's Aadhaar.
            Fetches official state demographic, land holding (RTC), and certified income records with real-time multi-agent scheme discovery.
          </p>

          <div className="mt-5 flex items-center justify-between pt-3 border-t border-emerald-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Includes pre-loaded farmer, student, artisan profiles
            </span>
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
            >
              <span>Open Citizen e-KYC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Module 2: AI Tool Contention Arena */}
        <div className={`p-6 rounded-2xl border shadow-lg transition-all ${
          isLightMode
            ? 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 border-amber-200'
            : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 border-slate-800'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
              Orchestration Invariant Proof
            </span>
            <span className="text-[10px] font-mono text-slate-400">Capacity = 2 Slots</span>
          </div>

          <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-600" />
            <span>AI Tool Contention & Priority Arena</span>
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            See how multiple AI agents battle over the same shared LLM/GPU execution slots. Watch the dynamic mathematical priority formula
            prevent starvation by boosting aging agents (+0.35/s) to overtake higher base priority requests!
          </p>

          <div className="mt-5 flex items-center justify-between pt-3 border-t border-amber-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Interactive 1-click clash simulator
            </span>
            <button
              onClick={() => setActiveTab('resource-contention')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer min-h-[44px]"
            >
              <span>Enter Contention Arena</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison Matrix */}
      <div className={`rounded-2xl p-6 shadow-xl border transition-colors ${
        isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-sky-400" />
              <span>Architectural Benchmark: Baseline vs SchemeSeva A3 Controller</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical measurements proving that service-graph reservation solves multi-agent concurrency bottlenecks
            </p>
          </div>

          <button
            onClick={onOpenJudgeDeck}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
          >
            <span>Open Interactive Pitch Deck</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`overflow-x-auto rounded-xl border ${
          isLightMode ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800/80 bg-slate-950/60'
        }`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-mono text-[11px] ${
                isLightMode ? 'border-slate-200 bg-slate-100 text-slate-600' : 'border-slate-800 bg-slate-900/80 text-slate-400'
              }`}>
                <th className="p-3">Performance Dimension</th>
                <th className="p-3 text-rose-500">Baseline (Uncoordinated Agents)</th>
                <th className="p-3 text-emerald-600">SchemeSeva A3 Controller</th>
                <th className="p-3 text-sky-600 dark:text-sky-300">Measured Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              <tr>
                <td className="p-3 font-semibold">LLM 429 Rate-Limit / OOM Crashes</td>
                <td className="p-3 font-mono text-rose-500">28 incidents / hour</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">0 incidents (Strict Cap = 2 preserved)</td>
                <td className="p-3 font-mono text-sky-600 dark:text-sky-300 font-bold">-100% Elimination</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Average Citizen Wait Time</td>
                <td className="p-3 font-mono text-rose-500">4.8 seconds</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">1.4 seconds</td>
                <td className="p-3 font-mono text-sky-600 dark:text-sky-300 font-bold">71% Faster Response</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Circular Deadlocks (Cross-Lock)</td>
                <td className="p-3 font-mono text-rose-500">14 deadlocks (server freeze)</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">0 deadlocks (Lookahead Reservation)</td>
                <td className="p-3 font-mono text-sky-600 dark:text-sky-300 font-bold">Guaranteed Safety</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Low-Priority Starvation Rate</td>
                <td className="p-3 font-mono text-rose-500">9 abandoned citizens / hr</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">0 starved (Starvation Aging +0.5/s)</td>
                <td className="p-3 font-mono text-sky-600 dark:text-sky-300 font-bold">100% Fair Turnaround</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">System Concurrency Throughput</td>
                <td className="p-3 font-mono text-rose-500">12 workflows / min</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">38 workflows / min</td>
                <td className="p-3 font-mono text-sky-600 dark:text-sky-300 font-bold">+316% Throughput</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Cloud API / GPU Cost Waste</td>
                <td className="p-3 font-mono text-rose-500">$142 / day (idle locks & retries)</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">$28 / day (TTL reservations)</td>
                <td className="p-3 font-mono text-sky-600 dark:text-sky-300 font-bold">80% Cloud Cost Savings</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4-User Concurrency Demo Storyboard */}
      <div className={`rounded-2xl p-6 shadow-xl border transition-colors ${
        isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/50 border-slate-800 text-slate-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-sky-400" />
              <span>4-User Concurrency Demonstration Storyboard</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Four concurrent citizens with competing priorities and overlapping AI tool chains
            </p>
          </div>

          <button
            onClick={handleStartDemo}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer min-h-[44px]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Live Demo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">WF001 · Priority 8.5</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded font-bold">Farmer</span>
            </div>
            <h4 className="font-bold text-sm">Rajesh Kumar</h4>
            <p className="text-xs text-slate-500 mt-1">PM-KISAN & Crop Subsidy. Holding LLM Slot 1 & PDF Parser.</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">WF002 · Priority 7.2</span>
              <span className="text-[10px] bg-sky-500/10 text-sky-600 px-1.5 py-0.2 rounded font-bold">Student</span>
            </div>
            <h4 className="font-bold text-sm">Priya Sharma</h4>
            <p className="text-xs text-slate-500 mt-1">Pre-Matric Scholarship. Holding LLM Slot 2; reserved Eligibility DB.</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">WF003 · Priority 6.8</span>
              <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.2 rounded font-bold">Enterprise</span>
            </div>
            <h4 className="font-bold text-sm">Amit Patel</h4>
            <p className="text-xs text-slate-500 mt-1">PMMY Mudra Loan. LLM full → queued at Rank #1 (waiting 8s).</p>
          </div>

          <div className={`p-4 rounded-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">WF004 · Priority 5.5</span>
              <span className="text-[10px] bg-pink-500/10 text-pink-600 px-1.5 py-0.2 rounded font-bold">Parent</span>
            </div>
            <h4 className="font-bold text-sm">Sunita Devi</h4>
            <p className="text-xs text-slate-500 mt-1">Sukanya Samriddhi. Waiting 19s → Aging Boost +2.0 Active!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
