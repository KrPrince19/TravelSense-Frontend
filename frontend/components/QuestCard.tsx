"use client";

import { useState, useRef } from "react";
import { MapPin, CheckCircle2, Trophy, Navigation, Camera, Loader2, XCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface QuestProps {
  quest: {
    _id: string;
    title: string;
    riddle: string;
    isCompleted: boolean;
    points: number;
    lat: number;
    lon: number;
    city: string;
  };
  distance: number | null; // Distance in meters
  onComplete?: () => void;
}

export default function QuestCard({ quest, distance, onComplete }: QuestProps) {
  const { user } = useUser();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInRange = distance !== null && distance <= 50;

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      
      try {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        const res = await fetch(`${BACKEND_URL}/api/quests/${quest._id}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64: base64String,
            city: quest.city,
            clerkId: user?.id
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          if (onComplete) onComplete();
        } else {
          setError(data.verification?.reason || "AI couldn't verify this landmark. Try a clearer shot!");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
      quest.isCompleted 
        ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50 shadow-sm" 
        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl"
    }`}>
      
      {/* Hidden Camera Input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleCapture}
        className="hidden" 
      />

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          quest.isCompleted 
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" 
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        }`}>
          {quest.isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Navigation className="w-3 h-3" />}
          {quest.isCompleted ? "Captured" : "Active Quest"}
        </div>
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-xs">
          <Trophy className="w-3.5 h-3.5" />
          {quest.points} PTS
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-6">
        <h3 className={`text-xl font-black tracking-tight ${quest.isCompleted ? "text-slate-400" : "text-slate-900 dark:text-white"}`}>
          {quest.isCompleted ? quest.title : "???"} 
        </h3>
        <p className={`text-sm leading-relaxed ${quest.isCompleted ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
          {quest.riddle}
        </p>
      </div>

      {/* Error / Loading Feedback */}
      {isVerifying && (
        <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mb-4 border border-indigo-100 dark:border-indigo-900/30 animate-pulse">
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Vision Inspecting...</span>
        </div>
      )}

      {error && !isVerifying && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl mb-4 border border-red-100 dark:border-red-900/20 text-red-600">
            <XCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold leading-tight">{error}</span>
        </div>
      )}

      {/* Footer / Capture Button */}
      {!quest.isCompleted && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isInRange ? "bg-emerald-500 animate-ping" : "bg-slate-300 dark:bg-slate-700"}`}></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {distance !== null ? `${Math.round(distance)}m Away` : "Searching GPS..."}
            </span>
          </div>
          {isInRange && !isVerifying && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all animate-in zoom-in"
            >
              <Camera className="w-4 h-4" />
              Capture Discovery
            </button>
          )}
        </div>
      )}

      {/* Background Icon Decoration */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transform rotate-12 ${quest.isCompleted ? "text-emerald-500" : "text-slate-900"}`}>
        <Trophy className="w-32 h-32" />
      </div>
    </div>
  );
}
