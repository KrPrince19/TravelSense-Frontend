"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useLocation } from "@/hooks/useLocation";
import AssistantChat from "@/components/AssistantChat";
import ErrorAlert from "@/components/ErrorAlert";
import WeatherWidget from "@/components/WeatherWidget";
import SafetyOverlay from "@/components/SafetyOverlay";
import QuestCard from "@/components/QuestCard";
import StoryBook from "@/components/StoryBook";
import { 
  Calendar, Clock, MapPin, ChevronRight, Sparkles, 
  ArrowLeft, Trophy, BookMarked, Sparkle, Loader2,
  Compass, History, LayoutDashboard, AlertTriangle, CheckCircle2, Award
} from "lucide-react";

const getWeatherCondition = (code: number) => {
  const mapping: Record<number, string> = {
    0: "Clear Sky",
    1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing Rime Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Slight Snowfall", 73: "Moderate Snowfall", 75: "Heavy Snowfall",
    80: "Slight Rain Showers", 81: "Moderate Rain Showers", 82: "Violent Rain Showers",
    95: "Thunderstorm", 96: "Thunderstorm with Slight Hail", 99: "Thunderstorm with Heavy Hail"
  };
  return mapping[code] || "Clear Sky";
};

export default function AssistantPage() {
  const { user } = useUser();
  const { locationDetails, coordinates } = useLocation();
  const [itinerary, setItinerary] = useState<any>(null);
  const [triggerQuery, setTriggerQuery] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [safety, setSafety] = useState<any>(null);
  const [isSafetyLoading, setIsSafetyLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [tripSaved, setTripSaved] = useState(false);

  const cityName = locationDetails?.city || "Nellore";

  // Haversine Distance Formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  useEffect(() => {
    const fetchQuests = async () => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        try {
            const res = await fetch(`${BACKEND_URL}/api/quests/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city: cityName, clerkId: user?.id })
            });
            console.log("QUEST API STATUS:", res.status, res.headers.get("content-type"));
            const data = await res.json();
            if (res.status === 429) {
                setIsLimitReached(true);
            }
            setQuests(Array.isArray(data) ? data : []);
        } catch (e) { 
            console.error("Quest fetch error", e);
            setIsLimitReached(true); // Treat as limit if it fails during high-load tests
        }
    };
    if (cityName) fetchQuests();
  }, [cityName]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fallback to Nellore coordinates if geolocation is not available yet
        const lat = coordinates.latitude || 14.4426; 
        const lon = coordinates.longitude || 79.9865;
        
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        const data = await res.json();
        const current = data.current;
        
        setWeather({
          temp: Math.round(current.temperature_2m).toString(),
          condition: getWeatherCondition(current.weather_code),
          humidity: current.relative_humidity_2m.toString(),
          wind: current.wind_speed_10m.toString(),
          city: cityName,
          isRainy: [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(current.weather_code)
        });
      } catch (e) { console.error("Failed to fetch weather", e); }
    };
    if (cityName || coordinates.latitude) fetchWeather();
  }, [cityName, coordinates.latitude, coordinates.longitude]);

  useEffect(() => {
    const fetchStories = async () => {
        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
            const res = await fetch(`${BACKEND_URL}/api/stories?city=${cityName}&clerkId=${user?.id}`);
            if (res.status === 429) setIsLimitReached(true);
            const data = await res.json();
            setStories(Array.isArray(data) ? data : []);
        } catch (e) { console.error("Story fetch error", e); }
    };
    if (cityName) fetchStories();
  }, [cityName]);

  useEffect(() => {
    const fetchSafety = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        setIsSafetyLoading(true);
        setSafetyError(null);
        try {
            const query = new URLSearchParams({
              city: cityName,
              lat: (coordinates.latitude || 0).toString(),
              lon: (coordinates.longitude || 0).toString()
            });
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
            const res = await fetch(`${BACKEND_URL}/api/safety?${query}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            console.log("SAFETY API STATUS:", res.status, res.headers.get("content-type"));
            if (!res.ok) throw new Error("Safety timeout or error");
            
            const data = await res.json();
            setSafety(data);
        } catch (e: any) { 
            console.error("Safety fetch error", e);
            if (e.name === 'AbortError') {
                setSafetyError("Safety stats are taking too long to load. Try again later.");
            } else {
                setSafetyError("Unable to fetch real-time safety stats right now.");
            }
        } finally {
            setIsSafetyLoading(false);
        }
    };
    if (cityName) fetchSafety();
  }, [cityName, coordinates.latitude, coordinates.longitude]);

  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    setIsGeneratingStory(true);
    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        const res = await fetch(`${BACKEND_URL}/api/stories/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city: cityName, itinerary, clerkId: user?.id })
        });
        const data = await res.json();
        setStories(prev => [data, ...prev]);
    } catch (e) { console.error("Story generation error", e); }
    finally { setIsGeneratingStory(false); }
  };

  const handleGenerateClick = () => {
    setTriggerQuery(`Generate a comprehensive 3-day travel itinerary for ${cityName}.`);
  };

  const handleCompleteTrip = async () => {
    if (!itinerary || !user) return;
    setIsSavingTrip(true);
    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        const res = await fetch(`${BACKEND_URL}/api/profile/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                destination: cityName, 
                planJSON: itinerary, 
                clerkId: user.id,
                isCompleted: true 
            })
        });
        if (res.ok) {
            setTripSaved(true);
            setTimeout(() => setTripSaved(false), 3000);
        }
    } catch (e) { console.error("Trip save error", e); }
    finally { setIsSavingTrip(false); }
  };

  return (
    <main className="min-h-screen bg-[#fcfdfe] dark:bg-slate-950">
      
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-900/50 px-6 py-4 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800"
            >
              <ArrowLeft className="w-3 h-3" />
              Exit
            </Link>
            <div className="h-6 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{cityName} <span className="text-indigo-600">Assistant</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Travel Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
               <Sparkles className="w-3 h-3" />
               <span className="text-[10px] font-black uppercase tracking-widest">Powered by Gemini 2.0</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
        
        {/* Main Grid: Itinerary & Chat */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: The Experience */}
          <div className="lg:col-span-8 flex flex-col gap-10 w-full">
            
            {/* Row 1: Status Widgets */}
            <div className="flex flex-col gap-6 w-full">
               {isLimitReached && <ErrorAlert type="quota" className="mb-2" />}
               <WeatherWidget weather={weather} />
               <SafetyOverlay data={safety} isLoading={isSafetyLoading} error={safetyError} />
            </div>

            {/* Row 2: Live Itinerary */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none min-h-[600px] flex flex-col overflow-hidden">
               <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Your Live Itinerary</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Updates in real-time based on your chat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {itinerary && (
                      <button 
                         onClick={handleCompleteTrip}
                         disabled={isSavingTrip || tripSaved}
                         className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-xl flex items-center gap-2 ${
                             tripSaved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                         }`}
                      >
                        {isSavingTrip ? <Loader2 className="w-3 h-3 animate-spin" /> : tripSaved ? <CheckCircle2 className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                        {tripSaved ? "Trip Archived!" : "Complete Trip"}
                      </button>
                    )}
                    {!itinerary && (
                      <button 
                         onClick={handleGenerateClick}
                         className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-xl"
                      >
                        Generate 3-Day Plan
                      </button>
                    )}
                  </div>
               </div>

               <div className="flex-1 p-10 overflow-y-auto max-h-[800px] scrollbar-hide">
                  {!itinerary ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-[3rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center animate-pulse">
                          <Compass className="w-14 h-14 text-indigo-200 dark:text-indigo-800" />
                        </div>
                        <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-indigo-500 animate-spin-slow" />
                      </div>
                      <div className="max-w-md">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Begin Your Adventure</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                          I'm ready to craft a personalized journey through {cityName}. 
                          Click the button above or tell me your preferences in the chat to start.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                           {["Foodie Journey 🍜", "Historical Tour 🏛️", "Solo Adventure 🎒"].map(tag => (
                             <span key={tag} className="px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               {tag}
                             </span>
                           ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-16">
                      {itinerary.days?.map((day: any) => (
                        <div key={day.day} className="relative pl-12 space-y-8 border-l border-slate-100 dark:border-slate-800">
                          {/* Day Header Marker */}
                          <div className="absolute top-0 -left-6 w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-lg shadow-xl">
                            {day.day}
                          </div>
                          
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-10">Day {day.day} Summary</h2>
                          
                          <div className="grid gap-6">
                            {day.activities.map((act: any, idx: number) => (
                              <div key={idx} className="group p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all duration-500 hover:shadow-2xl">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <Clock className="w-4 h-4 text-indigo-500" />
                                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{act.time}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{act.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{act.description}</p>
                                  </div>
                                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="w-5 h-5" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>

            {/* Row 3: Quests (Compact Row) */}
            <section className="space-y-8">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active City Quests</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discover Rewards</span>
               </div>
               {/* Main Layout Grid */}
          {/* AI Quota Banner Removed since we use ErrorAlert above now */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quests.map((q) => (
                    <QuestCard 
                      key={q._id} 
                      quest={q} 
                      distance={coordinates.latitude && coordinates.longitude ? getDistance(coordinates.latitude, coordinates.longitude, q.lat, q.lon) : null} 
                      onComplete={() => {
                        // Refresh quests after discovery
                        const fetchQuests = async () => {
                            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
                            const res = await fetch(`${BACKEND_URL}/api/quests?city=${cityName}`);
                            const data = await res.json();
                            setQuests(Array.isArray(data) ? data : []);
                        };
                        fetchQuests();
                      }}
                    />
                  ))}
               </div>
            </section>

          </div>

          {/* Right: The Buddy (Sticky) */}
          <div className="lg:col-span-4 w-full sticky top-28 h-[700px]">
             <AssistantChat 
               location={cityName}
               coordinates={{ lat: coordinates.latitude, lon: coordinates.longitude }}
               currentItinerary={itinerary}
               onItineraryUpdate={setItinerary}
               triggerQuery={triggerQuery}
             />
          </div>

        </div>

        {/* Full Width Footer: Stories */}
        <section className="border-t border-slate-100 dark:border-slate-900 pt-20 pb-32 space-y-16">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-8 max-w-5xl mx-auto text-center sm:text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-center sm:justify-start gap-4">
                   <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <BookMarked className="w-6 h-6" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Your Travel Memories</h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Automatic diary of your most significant milestones in {cityName}.</p>
              </div>
              <button 
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="group flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95"
                >
                  {isGeneratingStory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                  Generate Daily Story
                </button>
           </div>

           <div className="space-y-20">
              {stories.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] max-w-4xl mx-auto flex flex-col items-center gap-4">
                      <History className="w-12 h-12 text-slate-100 dark:text-slate-800" />
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">No stories yet. Keep exploring to fill your scrapbook.</p>
                  </div>
              ) : (
                  stories.map((s) => (
                      <StoryBook key={s._id} story={s} />
                  ))
              )}
           </div>
        </section>

      </div>
    </main>
  );
}
