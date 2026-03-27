"use client";

import { BookOpen, Share2, Calendar, Star, Quote } from "lucide-react";

interface Story {
  _id: string;
  city: string;
  narrative: string;
  questCount: number;
  createdAt: string;
}

export default function StoryBook({ story }: { story: Story }) {
  const date = new Date(story.createdAt).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="relative group w-full max-w-4xl mx-auto">
      {/* Decorative Scrapbook Elements */}
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>

      <div className="relative bg-[#fffdfa] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 sm:p-12 shadow-2xl overflow-hidden shadow-slate-200/50 dark:shadow-none">
        
        {/* Washi Tape Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-10 bg-indigo-600/10 dark:bg-indigo-400/10 backdrop-blur-sm transform rotate-1 border-x border-indigo-600/20"></div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em]">
              <Calendar className="w-3 h-3" />
              {date}
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              A Day in {story.city}
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Milestones</span>
                <div className="flex gap-1">
                    {[...Array(Math.min(story.questCount, 5))].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                </div>
             </div>
          </div>
        </div>

        {/* Narrative Content */}
        <div className="relative">
          <Quote className="absolute -top-6 -left-6 w-12 h-12 text-slate-100 dark:text-slate-800 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            {story.narrative.split('\n\n').map((para, i) => (
              <p 
                key={i} 
                className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 font-medium leading-[1.8] first-letter:text-5xl first-letter:font-black first-letter:text-indigo-600 first-letter:float-left first-letter:mr-3 first-letter:mt-1"
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold font-mono">
                <BookOpen className="w-4 h-4" />
                MEMOIR NO. {story._id.slice(-4).toUpperCase()}
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                <Share2 className="w-4 h-4" />
                Share Story
            </button>
        </div>
      </div>
    </div>
  );
}
