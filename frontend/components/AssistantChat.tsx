"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MapPin, Loader2, FastForward } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AssistantChatProps {
  location: string;
  coordinates: { lat: number | null; lon: number | null };
  currentItinerary: any;
  onItineraryUpdate: (newItinerary: any) => void;
  triggerQuery?: string | null;
}

export default function AssistantChat({ 
  location, 
  coordinates, 
  currentItinerary, 
  onItineraryUpdate,
  triggerQuery
}: AssistantChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hello! I'm your AI Travel Buddy. I see you're exploring ${location || 'your current location'}. How can I help you with your trip today?` }
  ]);
  
  useEffect(() => {
    if (triggerQuery) {
        handleSend(triggerQuery);
    }
  }, [triggerQuery]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const res = await fetch(`${BACKEND_URL}/api/assistant/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          currentItinerary,
          location,
          coordinates,
          clerkId: user?.id
        })
      });

      const data = await res.json();
      
      if (data.updatedItinerary) {
        onItineraryUpdate(data.updatedItinerary);
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    { label: "Skip Next Stop", action: "I'd like to skip the next activity in my plan." },
    { label: "Need Food Now", action: "I'm hungry! Find me a great local restaurant near my current location." },
    { label: "Culture Tip", action: "Tell me a unique cultural tip for this city." }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Travel Buddy AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
          <MapPin className="w-3 h-3" />
          {location || "Detecting..."}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
              msg.role === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none"
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          </div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s.action)}
              className="flex-shrink-0 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-100 dark:border-slate-700 transition-colors active:scale-95"
            >
              {s.label}
            </button>
          ))}
        </div>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your trip..."
            className="w-full pl-5 pr-14 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
