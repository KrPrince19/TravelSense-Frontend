"use client";

import { CloudRain, Sun, Cloud, Thermometer, Wind, Droplets } from "lucide-react";

interface WeatherData {
  temp: string;
  condition: string;
  humidity: string;
  wind: string;
  city: string;
  isRainy: boolean;
}

export default function WeatherWidget({ weather }: { weather: WeatherData | null }) {
  if (!weather) return null;

  const Icon = weather.isRainy ? CloudRain : weather.condition.toLowerCase().includes('cloud') ? Cloud : Sun;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/20 dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl ${weather.isRainy ? 'bg-blue-600 shadow-blue-500/40' : 'bg-amber-500 shadow-amber-500/40'}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {weather.temp}°C
              </span>
              {weather.isRainy && (
                <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-100 dark:border-red-900/30">
                  Storm Alert
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{weather.condition} in {weather.city}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-6 sm:pt-0 sm:pl-8">
          <div className="flex flex-col items-center gap-1">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{weather.humidity}%</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Humidity</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{weather.wind} km/h</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Wind</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">Feels Like</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
