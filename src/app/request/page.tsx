"use client";

import { useState } from "react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Send, UploadCloud, User, AutoAwesome, Sparkles } from "lucide-react";

export default function ReviewRequestPage() {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  
  // Single Request State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [aiContextSingle, setAiContextSingle] = useState("");

  // Bulk Request State
  const [aiContextBulk, setAiContextBulk] = useState("");

  const mockBulkData = [
    { name: "Marcus Aurelius", phone: "+1 (555) 000-0000", snippet: "Hey Marcus! This is coach Sarah from RepFit. I saw you crushed..." },
    { name: "Jane Doe", phone: "+1 (555) 000-0001", snippet: "Jane, great work in the weekend HIIT class. Mind leaving us a..." },
    { name: "Alex Mercer", phone: "+1 (555) 000-0002", snippet: "Alex! Your deadlift PR is insane. Can you drop a quick review..." },
  ];

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto pb-[24px]">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-[24px]">
        <div>
          <span className="text-[10px] text-[#cafd00] uppercase tracking-[0.2em] font-sans mb-2 block font-bold">
            Campaign Suite
          </span>
          <h1 className="text-6xl font-black tracking-tighter text-[#ffffff]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            Templates
          </h1>
        </div>
        
        {/* Sleek Pill Toggle */}
        <div className="bg-[#131313] p-1.5 rounded-full flex gap-1 items-center">
          <button 
            onClick={() => setMode("single")}
            className={`px-6 py-2 text-sm rounded-full transition-all flex items-center ${mode === "single" ? "bg-[#262626] text-[#ffffff] font-bold" : "text-[#adaaaa] hover:text-[#ffffff] font-medium"}`}
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Single Request
          </button>
          <button 
            onClick={() => setMode("bulk")}
            className={`px-6 py-2 text-sm rounded-full transition-all flex items-center ${mode === "bulk" ? "bg-[#262626] text-[#ffffff] font-bold" : "text-[#adaaaa] hover:text-[#ffffff] font-medium"}`}
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Bulk Upload
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Data Entry Views */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          
          {mode === "single" ? (
            /* --- SINGLE REQUEST VIEW --- */
            <section className="bg-[#131313] p-10 rounded-[4px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                    Customer Name
                  </label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-4 text-lg font-medium text-[#ffffff] placeholder:text-white/10 transition-all focus:border-[#f3ffca] focus:ring-0 focus:shadow-[0_4px_12px_-4px_rgba(202,253,0,0.2)] font-sans"
                    placeholder="e.g. Marcus Aurelius" 
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-4 text-lg font-medium text-[#ffffff] placeholder:text-white/10 transition-all focus:border-[#f3ffca] focus:ring-0 focus:shadow-[0_4px_12px_-4px_rgba(202,253,0,0.2)] font-sans"
                    placeholder="+1 (555) 000-0000" 
                  />
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  AI Message Context
                </label>
                <textarea 
                  value={aiContextSingle}
                  onChange={(e) => setAiContextSingle(e.target.value)}
                  className="bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-4 text-lg font-medium text-[#ffffff] placeholder:text-white/10 resize-none transition-all focus:border-[#f3ffca] focus:ring-0 focus:shadow-[0_4px_12px_-4px_rgba(202,253,0,0.2)] font-sans" 
                  placeholder="Describe the goal... (e.g. check-in on their weight loss progress and invite to weekend HIIT class)" 
                  rows={3}
                ></textarea>
              </div>

              <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-[16px]">
                <button className="w-full md:w-auto px-8 py-4 bg-[#262626] text-[#ffffff] text-sm font-bold rounded-[4px] border border-[#484847]/15 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  <Sparkles size={16} />
                  Generate AI Draft
                </button>
                <PremiumButton className="w-full md:w-auto px-12 uppercase tracking-tighter" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  Send Request
                </PremiumButton>
              </div>
            </section>
          ) : (
            /* --- BULK UPLOAD VIEW --- */
            <section className="flex flex-col gap-12">
              <div className="bg-[#131313] p-[24px] rounded-[4px] border-2 border-dashed border-[#484847]/30 flex flex-col items-center justify-center text-center group hover:bg-[#1a1a1a] transition-all cursor-pointer h-[200px]">
                <div className="w-12 h-12 bg-[#262626] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} className="text-[#cafd00]" />
                </div>
                <h3 className="text-[#ffffff] font-bold text-lg" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Drag & Drop CSV</h3>
                <p className="text-[#adaaaa] text-sm mt-2 font-sans">Supported format: .csv with Name, Phone columns</p>
              </div>

              <div className="bg-[#131313] p-10 rounded-[4px]">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                    AI Message Context (Applied to all)
                  </label>
                  <textarea 
                    value={aiContextBulk}
                    onChange={(e) => setAiContextBulk(e.target.value)}
                    className="bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-4 text-lg font-medium text-[#ffffff] placeholder:text-white/10 resize-none transition-all focus:border-[#f3ffca] focus:ring-0 focus:shadow-[0_4px_12px_-4px_rgba(202,253,0,0.2)] font-sans w-full" 
                    placeholder="Provide universal context... (e.g. Congratulate them on joining the New Years Challenge)" 
                    rows={3}
                  ></textarea>
                </div>
              </div>

              {/* Minimalist Data Table preview */}
              <div className="bg-[#1a1a1a] p-8 rounded-[4px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-[#ffffff]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Bulk Campaign Queue</h3>
                  <span className="text-[10px] text-[#cafd00] uppercase tracking-widest font-bold">3 Rows Parsed</span>
                </div>
                
                <div className="flex flex-col space-y-4">
                  {mockBulkData.map((row, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-[#262626] rounded-[4px]">
                      <div className="flex items-center gap-[16px] w-full md:w-1/3 mb-2 md:mb-0">
                        <User size={16} className="text-[#adaaaa]" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#ffffff] font-sans">{row.name}</span>
                          <span className="text-[10px] text-[#adaaaa] font-sans">{row.phone}</span>
                        </div>
                      </div>
                      <div className="w-full md:w-2/3 md:pl-8">
                        <p className="text-[12px] text-[#adaaaa] truncate font-sans italic border-l border-[#484847]/30 pl-4">
                          {row.snippet}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <PremiumButton className="w-full md:w-auto px-12 py-4 uppercase tracking-tighter" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                    Launch Campaign
                  </PremiumButton>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Right Column: SMS Preview Visual (Glassmorphism + Tonal Layers) */}
        <div className="col-span-12 lg:col-span-5 relative">
          <div className="sticky top-12">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#cafd00]/5 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="bg-[#262626]/60 backdrop-blur-[40px] p-8 rounded-[4px] border border-white/5 relative overflow-hidden shadow-[0_0_32px_rgba(255,255,255,0.04)]">
              <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-[#262626] rounded-full flex items-center justify-center mb-2">
                  <User size={20} className="text-[#adaaaa]" />
                </div>
                <span className="text-[10px] font-bold text-[#adaaaa] tracking-widest uppercase" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  SMS Preview
                </span>
              </div>

              {/* Message Bubbles */}
              <div className="space-y-6">
                <div className="flex flex-col gap-1 items-start">
                  <div className="bg-[#262626] px-5 py-3 rounded-[16px] rounded-bl-sm max-w-[85%]">
                    <p className="text-sm text-[#ffffff] leading-relaxed font-sans">
                      Hey {name || "Marcus"}! This is coach Sarah from RepFit.
                    </p>
                  </div>
                  <span className="text-[10px] text-[#adaaaa] ml-2 font-sans">10:42 AM</span>
                </div>
                
                <div className="flex flex-col gap-1 items-start">
                  <div className="bg-[#262626] px-5 py-3 rounded-[16px] rounded-bl-sm max-w-[85%] border-l-2 border-[#cafd00]">
                    <p className="text-sm text-[#ffffff] leading-relaxed font-sans">
                      {mode === "single" 
                        ? (aiContextSingle || "I saw you crushed your PR yesterday. Ready to take on the Saturday HIIT challenge? 🔥")
                        : (aiContextBulk || "Did you know you're one of our top members this month? Drop us a review! 🌟")}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#adaaaa] ml-2 font-sans">Just now</span>
                </div>
                
                <div className="pt-8 border-t border-white/5 mt-8">
                  <div className="flex items-center gap-3 bg-[#0e0e0e]/50 px-4 py-3 rounded-full border border-white/5">
                    <div className="flex-1 text-xs text-[#adaaaa] font-sans">Type a message...</div>
                    <Send size={16} className="text-[#cafd00]" />
                  </div>
                </div>
              </div>

            </div>

             {/* Decorative Element matching blueprint */}
            <div className="mt-8 flex gap-4 overflow-hidden">
              <div className="flex-1 bg-[#131313] h-1 rounded-full overflow-hidden">
                <div className="bg-[#cafd00] w-1/3 h-full"></div>
              </div>
              <div className="flex-1 bg-[#131313] h-1 rounded-full"></div>
              <div className="flex-1 bg-[#131313] h-1 rounded-full"></div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
