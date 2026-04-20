"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { saveReviewLink } from "@/app/actions/settings";
import { Link as LinkIcon, CheckCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { userId } = useAuth();
  const [link, setLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!userId || !link) return;

    setIsSaving(true);
    try {
      const res = await saveReviewLink(userId, link);
      if (res.success) {
        setSaved(true);
        // Reset the success message after 3 seconds
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save. Please check your connection.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-w-4xl mx-auto pb-[24px] relative px-4 md:px-0">
      {/* Header Section */}
      <header className="flex flex-col mb-8 md:mb-12">
        <span className="text-[10px] text-[#cafd00] uppercase tracking-[0.2em] font-sans mb-2 block font-bold">
          Platform Configuration
        </span>
        <h1
          className="text-4xl md:text-6xl font-black tracking-tighter text-[#ffffff]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Settings
        </h1>
      </header>

      {/* Settings Card */}
      <section className="bg-[#131313] p-6 md:p-10 rounded-[4px] flex flex-col gap-8 min-w-0 border border-white/5 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#cafd00]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-2">
          <h3
            className="text-xl md:text-2xl font-bold text-[#ffffff]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Google Review Link
          </h3>
          <p className="text-[#adaaaa] text-sm font-sans max-w-2xl leading-relaxed">
            This is the exact link the AI will send to your customers when
            asking for a review. Make sure it directs them straight to the
            5-star review popup!
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <label
            className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold flex items-center gap-2"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            <LinkIcon size={14} className="text-[#cafd00]" />
            Your Public Review URL
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-[4px] px-4 py-3 md:py-4 text-sm md:text-base font-medium text-[#ffffff] placeholder:text-white/20 transition-all focus:border-[#cafd00] focus:ring-1 focus:ring-[#cafd00]/50 font-sans"
              placeholder="https://g.page/r/your-business-id/review"
            />

            <PremiumButton
              onClick={handleSave}
              disabled={isSaving || !link || saved}
              className={`w-full md:w-auto px-8 py-3 md:py-4 shrink-0 transition-all ${saved ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20" : ""}`}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </span>
              ) : saved ? (
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} /> Saved!
                </span>
              ) : (
                "Save Link"
              )}
            </PremiumButton>
          </div>
        </div>
      </section>
    </div>
  );
}
