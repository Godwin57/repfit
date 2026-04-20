"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { saveGymSettings, getGymSettings } from "@/app/actions/settings";
import {
  Link as LinkIcon,
  CheckCircle,
  Loader2,
  Globe,
  User,
  Building,
  AlertCircle,
} from "lucide-react";

const TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const { userId } = useAuth();

  const [link, setLink] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [senderName, setSenderName] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      if (!userId) return;
      const res = await getGymSettings(userId);
      if (res.success && res.settings) {
        if (res.settings.googleReviewLink)
          setLink(res.settings.googleReviewLink);
        if (res.settings.timezone) setTimezone(res.settings.timezone);
        if (res.settings.senderName) setSenderName(res.settings.senderName);
        if (res.settings.businessName)
          setBusinessName(res.settings.businessName);
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [userId]);

  const handleSave = async () => {
    setError(""); // <-- NEW: Clear previous errors

    if (!userId || !link || !senderName || !businessName) {
      setError("Please fill out all fields before saving."); // <-- NEW: Inline error
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveGymSettings(
        userId,
        link,
        timezone,
        senderName,
        businessName,
      );
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Failed to save settings. Please try again."); // <-- NEW: Inline error
      }
    } catch (err) {
      console.error(err);
      setError("A critical error occurred while saving."); // <-- NEW: Inline error
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-[#adaaaa]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full max-w-4xl mx-auto pb-[24px] relative px-4 md:px-0">
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

      <section className="bg-[#131313] p-6 md:p-10 rounded-[4px] flex flex-col gap-8 min-w-0 border border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#cafd00]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-2">
          <h3
            className="text-xl md:text-2xl font-bold text-[#ffffff]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Business Profile & Automation
          </h3>
          <p className="text-[#adaaaa] text-sm font-sans max-w-2xl leading-relaxed">
            Configure how the AI represents you. This data will be automatically
            injected into all your campaigns so you never have to type it again.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          {/* Identity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label
                className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold flex items-center gap-2"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <User size={14} className="text-[#cafd00]" />
                Sender Name (Your Name)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-[4px] px-4 py-3 text-sm font-medium text-[#ffffff] placeholder:text-white/20 transition-all focus:border-[#cafd00] focus:ring-1 focus:ring-[#cafd00]/50 font-sans"
                placeholder="e.g. Coach Sarah"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label
                className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold flex items-center gap-2"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <Building size={14} className="text-[#cafd00]" />
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-[4px] px-4 py-3 text-sm font-medium text-[#ffffff] placeholder:text-white/20 transition-all focus:border-[#cafd00] focus:ring-1 focus:ring-[#cafd00]/50 font-sans"
                placeholder="e.g. RepFit Gym"
              />
            </div>
          </div>

          {/* Links & Timezone Row */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col gap-3 w-full md:w-2/3">
              <label
                className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold flex items-center gap-2"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <LinkIcon size={14} className="text-[#cafd00]" />
                Your Public Review URL
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-[4px] px-4 py-3 text-sm font-medium text-[#ffffff] placeholder:text-white/20 transition-all focus:border-[#cafd00] focus:ring-1 focus:ring-[#cafd00]/50 font-sans"
                placeholder="https://g.page/r/your-business-id/review"
              />
            </div>

            <div className="flex flex-col gap-3 w-full md:w-1/3 shrink-0">
              <label
                className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold flex items-center gap-2"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <Globe size={14} className="text-[#cafd00]" />
                Gym Timezone
              </label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-[4px] px-4 py-3 text-sm font-medium text-[#ffffff] appearance-none transition-all focus:border-[#cafd00] focus:ring-1 focus:ring-[#cafd00]/50 font-sans cursor-pointer"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#adaaaa]">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end items-center gap-4 mt-2">
            {/* NEW: The sleek inline error message */}
            {error && (
              <div className="flex items-center gap-2 text-[#ff3333] bg-[#ff3333]/10 px-4 py-2 rounded-[4px] border border-[#ff3333]/20 w-full md:w-auto text-sm font-bold font-sans">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <PremiumButton
              onClick={handleSave}
              disabled={isSaving || saved}
              className={`w-full md:w-auto px-12 py-3 md:py-4 shrink-0 transition-all ${saved ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/20" : ""}`}
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
                "Save Configuration"
              )}
            </PremiumButton>
          </div>
        </div>
      </section>
    </div>
  );
}
