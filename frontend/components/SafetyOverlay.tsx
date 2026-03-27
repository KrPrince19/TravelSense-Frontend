"use client";

import { Shield, AlertTriangle, Heart, PhoneCall, Info, ShieldOff } from "lucide-react";

interface SafetyData {
  status: 'Safe' | 'Moderate' | 'Caution';
  safetyTip: string;
  healthAlert: string;
  emergency: string;
}

interface SafetyOverlayProps {
  data: SafetyData | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function SafetyOverlay({ data, isLoading, error }: SafetyOverlayProps) {
  if (isLoading) {
    return (
      <div className="w-full p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
           <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
           </div>
        </div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center py-4">
           Analyzing real-time safety data...
        </div>
      </div>
    );
  }

  if (error || (!data && !isLoading)) {
    return (
      <div className="w-full p-8 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
         <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                <ShieldOff className="w-6 h-6" />
            </div>
            <h3 className="text-amber-900 dark:text-amber-400 font-black uppercase text-sm tracking-tight">Safety Data Delayed</h3>
            <p className="text-amber-700 dark:text-amber-500/70 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
               {error || "Real-time safety intelligence is currently offline. Please proceed with standard caution."}
            </p>
         </div>
      </div>
    );
  }

  const statusColors = {
    Safe: "bg-emerald-500 shadow-emerald-500/40 text-emerald-500",
    Moderate: "bg-amber-500 shadow-amber-500/40 text-amber-500",
    Caution: "bg-red-500 shadow-red-500/40 text-red-500"
  };

  const currentStatus = (data && data.status && statusColors[data.status]) ? data.status : "Safe";

  const statusBg = {
    Safe: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20",
    Moderate: "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20",
    Caution: "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"
  };

  return (
    <div className={`w-full p-5 rounded-[2.5rem] border ${statusBg[currentStatus]} transition-all duration-700 animate-in fade-in slide-in-from-right-4`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        
        {/* Status Indicator */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl ${statusColors[currentStatus].split(' ')[0]} flex items-center justify-center text-white shadow-lg`}>
              <Shield className="w-6 h-6" />
            </div>
            {data?.status !== "Safe" && (
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${statusColors[currentStatus].split(' ')[0]} animate-ping`}></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-widest ${statusColors[currentStatus].split(' ')[2]}`}>
                    {data?.status || "Safe"} Zone
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">AI Security Check Passed</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mt-1">
                {currentStatus === "Safe" ? "Nominal Threat Level" : "Contextual Alert Active"}
            </h3>
          </div>
        </div>

        {/* Quick Insights Row */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-white dark:border-slate-800 shadow-sm flex-1 lg:flex-none">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                    <Info className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Safety Tip</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[150px]">{data?.safetyTip || "Be aware of surroundings"}</span>
                </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-2xl border border-white dark:border-slate-800 shadow-sm flex-1 lg:flex-none">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                    <Heart className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Health Alert</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[150px]">{data?.healthAlert || "Stay hydrated"}</span>
                </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl shadow-slate-900/20 flex-1 lg:flex-none">
                <div className="p-2 rounded-xl bg-white/10 dark:bg-slate-900/10">
                    <PhoneCall className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Emergency</span>
                    <span className="text-xs font-black truncate max-w-[120px]">{data?.emergency || "100"}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
