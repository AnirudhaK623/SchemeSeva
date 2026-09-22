import React from 'react';
import { Reservation } from '../../types/orchestrator.js';
import { Bookmark, Clock, ShieldCheck } from 'lucide-react';

interface ReservationTableProps {
  reservations: Reservation[];
  isLightMode?: boolean;
}

export const ReservationTable: React.FC<ReservationTableProps> = ({ reservations, isLightMode = false }) => {
  const activeReservations = reservations.filter(r => r.status === 'ACTIVE' || r.status === 'PROMOTED');

  if (activeReservations.length === 0) {
    return (
      <div className={`rounded-2xl border p-8 text-center shadow-sm ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-800'
      }`}>
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center mx-auto mb-3">
          <Bookmark className="w-6 h-6 opacity-60" />
        </div>
        <h5 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
          No Active Advance Reservations
        </h5>
        <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
          The A3 Controller dynamically locks future slots when upcoming multi-agent dependencies are predicted.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${
      isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
        isLightMode ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div>
          <h4 className={`font-bold text-sm flex items-center space-x-2 ${
            isLightMode ? 'text-slate-900' : 'text-slate-100'
          }`}>
            <span>A3 Proactive Resource Reservations</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-mono font-bold">
              {activeReservations.length} slots reserved
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Proactively reserved future capacity protecting downstream workflows from latency spikes
          </p>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>Bottleneck Shield</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className={`uppercase text-[10px] tracking-wider border-b ${
            isLightMode ? 'bg-slate-100/70 text-slate-500 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
          }`}>
            <tr>
              <th className="py-2.5 px-4">Reservation ID</th>
              <th className="py-2.5 px-4">Workflow & Agent</th>
              <th className="py-2.5 px-4">Reserved Resource</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Timeout Window</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-mono ${
            isLightMode ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/60 text-slate-300'
          }`}>
            {activeReservations.map((res) => {
              const now = Date.now();
              const remainingSec = Math.max(0, Math.floor((res.expiry_time - now) / 1000));

              return (
                <tr
                  key={res.reservation_id}
                  className={`transition-colors ${isLightMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}
                >
                  <td className="py-3 px-4 font-bold text-purple-600 dark:text-purple-400">
                    {res.reservation_id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-sky-600 dark:text-sky-400">{res.workflow_id}</span>
                    <span className="text-slate-500 font-sans text-[11px] block">{res.agent_id.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 font-semibold text-purple-700 dark:text-purple-300">
                      {res.resource_id}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <span>{res.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{remainingSec}s TTL</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
