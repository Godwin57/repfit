"use client";

import { useState } from "react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Send, Smartphone, ChevronDown, PlusCircle, Smile, Paperclip, Clock } from "lucide-react";

export default function ReviewRequestPage() {
  const [content, setContent] = useState("Hey {{firstName}}, thanks for crushing your session at {{gymName}}! We'd love to hear about your progress. Mind leaving us a quick review? RepFit.app/r/elite");

  return (
    <div className="flex flex-col w-full h-full">
      {/* Page Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black font-headline tracking-tighter text-white mb-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Message Templates</h2>
          <p className="text-white/60 font-body text-lg max-w-xl font-sans">Customize your automated review requests to maintain an elite brand voice across every member interaction.</p>
        </div>
        <button className="bg-[#cafd00] text-[#3a4a00] font-headline font-extrabold px-8 py-4 rounded-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(202,253,0,0.15)] uppercase text-xs tracking-widest" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          Save Template
        </button>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Editor & Tools */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Tools Section */}
          <div className="bg-[#131313] p-6 rounded-lg space-y-4">
            <h3 className="font-bold text-[0.6875rem] uppercase tracking-[0.15em] text-white/40" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Dynamic Variables</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-[#cafd00]/10 border border-[#cafd00]/20 text-[#cafd00] rounded-lg font-bold text-xs hover:bg-[#cafd00]/20 transition-all flex items-center gap-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                <PlusCircle size={14} />
                {"{{firstName}}"}
              </button>
              <button className="px-4 py-2 bg-[#cafd00]/10 border border-[#cafd00]/20 text-[#cafd00] rounded-lg font-bold text-xs hover:bg-[#cafd00]/20 transition-all flex items-center gap-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                <PlusCircle size={14} />
                {"{{gymName}}"}
              </button>
              <button className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg font-bold text-xs hover:bg-white/10 transition-all flex items-center gap-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                <PlusCircle size={14} />
                {"{{lastVisitDate}}"}
              </button>
            </div>
          </div>

          {/* Editor Section */}
          <div className="bg-[#262626]/60 backdrop-blur-[40px] p-8 rounded-lg border-b border-[#484847]/15 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#cafd00] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-center mb-6">
              <label className="font-bold text-[0.75rem] uppercase tracking-[0.2em] text-[#cafd00]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>SMS Content</label>
              <span className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter), sans-serif" }}>{content.length} / 160 characters</span>
            </div>
            <textarea
              className="w-full h-64 bg-transparent border-none focus:ring-0 text-2xl font-medium text-white placeholder-white/10 resize-none leading-relaxed outline-none"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
              placeholder="Start typing your elite message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
              <Smile className="text-white/40 hover:text-white cursor-pointer" size={24} />
              <Paperclip className="text-white/40 hover:text-white cursor-pointer" size={24} />
              <Clock className="text-white/40 hover:text-white cursor-pointer" size={24} />
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-24">
            <h3 className="font-bold text-[0.6875rem] uppercase tracking-[0.15em] text-white/40 mb-6 text-center" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Real-Time Performance Preview</h3>
            
            {/* Smartphone Shell */}
            <div className="relative mx-auto w-[320px] h-[640px] bg-[#000000] rounded-[3rem] border-[8px] border-[#262626] shadow-2xl p-4 flex flex-col overflow-hidden">
              {/* Status Bar */}
              <div className="flex justify-between items-center px-6 py-2 mb-4">
                <span className="text-xs font-bold text-white font-sans">9:41</span>
                <div className="flex gap-1 items-center">
                   {/* Simplified Icons for Status Bar */}
                   <div className="flex gap-1">
                      <div className="w-1 h-2 bg-white rounded-sm mt-1"></div>
                      <div className="w-1 h-3 bg-white rounded-sm"></div>
                      <div className="w-1 h-2 bg-white/40 rounded-sm mt-1"></div>
                   </div>
                   <div className="w-4 h-2 border border-white/60 ml-1 rounded-sm relative">
                     <div className="absolute right-[-2px] top-[2px] w-[2px] h-1 bg-white/60 rounded-r-sm"></div>
                     <div className="w-[80%] h-full bg-white"></div>
                   </div>
                </div>
              </div>

              {/* Wallpaper Content Area */}
              <div 
                className="flex-1 rounded-[2rem] relative bg-cover bg-center overflow-hidden" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
              >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                
                {/* Lock Screen Clock */}
                <div className="pt-12 text-center text-white/90">
                  <span className="text-6xl font-extralight block font-sans">9:41</span>
                  <span className="text-sm font-medium font-sans">Monday, June 12</span>
                </div>
                
                {/* Notification Bubble */}
                <div className="absolute inset-x-4 top-[220px]">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-[#000000] rounded-md flex items-center justify-center border border-[#cafd00]/30">
                        <Smartphone size={10} className="text-[#cafd00]" />
                      </div>
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-sans">Messages</span>
                      <span className="text-[10px] text-white/30 ml-auto font-sans">now</span>
                    </div>
                    <p className="text-[13px] font-bold text-white mb-1 font-sans">RepFit Performance</p>
                    <p className="text-[12px] text-white/80 leading-snug font-sans line-clamp-3">
                      {content.replace('{{firstName}}', 'Alex').replace('{{gymName}}', 'RepFit Elite')}
                    </p>
                  </div>
                </div>
                
                {/* Bottom Home Bar */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-lg border-b border-white/5">
          <p className="font-bold text-[0.6875rem] uppercase tracking-[0.15em] text-white/40 mb-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Average CTR</p>
          <h4 className="text-4xl font-black text-[#cafd00]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>24.8%</h4>
          <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#cafd00] w-[24.8%]"></div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] p-6 rounded-lg border-b border-white/5">
          <p className="font-bold text-[0.6875rem] uppercase tracking-[0.15em] text-white/40 mb-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Review Conversion</p>
          <h4 className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-inter), sans-serif" }}>12.5%</h4>
          <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-white/40 w-[12.5%]"></div>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] p-6 rounded-lg border-b border-white/5">
          <p className="font-bold text-[0.6875rem] uppercase tracking-[0.15em] text-white/40 mb-2" style={{ fontFamily: "var(--font-inter), sans-serif" }}>Messages Sent (MTD)</p>
          <h4 className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-inter), sans-serif" }}>1,402</h4>
          <p className="text-xs text-[#cafd00] mt-2 font-sans">↑ 14% from last month</p>
        </div>
      </div>
    </div>
  );
}
