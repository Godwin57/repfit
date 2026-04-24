"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { PremiumButton } from "@/components/ui/PremiumButton";
import Papa from "papaparse"; // SURGICAL CUT 1: Imported PapaParse
import {
  Send,
  UploadCloud,
  User,
  Sparkles,
  CheckCircle,
  Loader2,
  Mail,
  MessageSquare,
  AlertCircle,
  Building,
} from "lucide-react";
import {
  generateAiMessages,
  saveCampaign,
  CustomerData,
  CustomerMessage,
} from "@/app/actions/campaign"; // Removed processCsvUpload
import { getGymSettings } from "@/app/actions/settings";

export default function ReviewRequestPage() {
  const [mode, setMode] = useState<"single" | "bulk">("bulk");
  const { userId } = useAuth();

  // Settings State
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [aiContextSingle, setAiContextSingle] = useState("");

  const [aiContextBulk, setAiContextBulk] = useState("");
  const [parsedData, setParsedData] = useState<CustomerData[]>([]);
  const [aiMessages, setAiMessages] = useState<CustomerMessage[]>([]);

  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(0);

  const [isSmsEnabled, setIsSmsEnabled] = useState(true);
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);

  const [generationMode, setGenerationMode] = useState<
    "AI Assist" | "Manual Template"
  >("AI Assist");
  const [manualTemplate, setManualTemplate] = useState(
    "Hey {Name}! This is {Sender} from {Gym}. We'd love your feedback!",
  );

  const [channelWarning, setChannelWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // SURGICAL CUT 2: Added error state for the UI
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!userId) return;
      const res = await getGymSettings(userId);
      if (
        res.success &&
        res.settings &&
        res.settings.senderName &&
        res.settings.businessName
      ) {
        setSenderName(res.settings.senderName);
        setBusinessName(res.settings.businessName);
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false);
      }
      setIsSettingsLoading(false);
    }
    loadSettings();
  }, [userId]);

  // SURGICAL CUT 3: Replaced backend processing with immediate client-side PapaParse
  const processFile = (file: File) => {
    setUploadError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setUploadError(`Error parsing file: ${results.errors[0].message}`);
          return;
        }

        // Map the generated CSV structure to what the UI expects
        const mappedData = results.data
          .map((row: any) => ({
            name:
              row["First Name"] && row["Last Name"]
                ? `${row["First Name"]} ${row["Last Name"]}`
                : row.Name || row.name || "Unknown",
            phone: row.Phone || row.phone || "",
            email: row.Email || row.email || "",
          }))
          .filter((c) => c.name !== "Unknown" || c.phone || c.email); // Remove totally blank rows

        if (mappedData.length === 0) {
          setUploadError("Could not find Name or Phone columns in this CSV.");
          return;
        }

        setParsedData(mappedData);
        setAiMessages([]);
        setSelectedCustomerIndex(0);
      },
      error: (err) => {
        setUploadError(`File reading error: ${err.message}`);
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = "";
  };

  const triggerWarning = () => {
    setChannelWarning(true);
    setTimeout(() => setChannelWarning(false), 3000);
  };

  const handleToggleSms = () => {
    if (isSmsEnabled && !isEmailEnabled) {
      triggerWarning();
      return;
    }
    setIsSmsEnabled(!isSmsEnabled);
  };

  const handleToggleEmail = () => {
    if (isEmailEnabled && !isSmsEnabled) {
      triggerWarning();
      return;
    }
    setIsEmailEnabled(!isEmailEnabled);
  };

  const handleGenerateMessages = async () => {
    if (parsedData.length === 0) return;

    if (generationMode === "Manual Template") {
      if (!manualTemplate) return;
      const newMessages = parsedData.map((data) => {
        const msg = manualTemplate
          .replace(/{Name}/g, data.name || "")
          .replace(/{Sender}/g, senderName)
          .replace(/{Gym}/g, businessName);

        return { customer: data, message: msg };
      });
      setAiMessages(newMessages);
    } else {
      if (!aiContextBulk) return;
      setIsLoading(true);
      try {
        const activeChannels = [];
        if (isSmsEnabled) activeChannels.push("SMS");
        if (isEmailEnabled) activeChannels.push("Email");

        const enhancedContext = `Sender: ${senderName}. Gym: ${businessName}. Channels: [${activeChannels.join(", ")}]. Context: ${aiContextBulk}`;
        const generated = await generateAiMessages(parsedData, enhancedContext);
        setAiMessages(generated);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleMessageEdit = (index: number, newText: string) => {
    setAiMessages((prev) => {
      const updated = [...prev];
      updated[index].message = newText;
      return updated;
    });
  };

  const insertPlaceholder = (placeholder: string) =>
    setManualTemplate((prev) => prev + placeholder);

  const handleLaunchCampaign = async () => {
    if (aiMessages.length === 0) return;
    if (!userId) {
      alert("Auth Error: Clerk lost your session. Please refresh the page.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await saveCampaign(
        userId,
        generationMode === "AI Assist"
          ? aiContextBulk
          : "Manual Template used.",
        aiMessages,
      );
      if (res.success) {
        setSuccess(true);
      } else {
        alert("Failed to save campaign to database.");
      }
    } catch (e) {
      console.error("Launch error:", e);
      alert("A critical error occurred while launching.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSettingsLoading) {
    return (
      <div className="flex h-full items-center justify-center text-[#adaaaa] min-h-[600px]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="flex flex-col w-full h-full max-w-7xl mx-auto pb-[24px] items-center justify-center min-h-[600px] px-4">
        <div className="text-center bg-[#131313] p-8 md:p-16 rounded-[4px] border border-[#ff3333]/30 shadow-2xl relative overflow-hidden w-full max-w-2xl">
          <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-[#ff3333] mx-auto mb-6 relative z-10" />
          <h2
            className="text-3xl md:text-4xl font-black tracking-tighter text-[#ffffff] mb-4 relative z-10"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Profile Incomplete
          </h2>
          <p className="text-[#adaaaa] mb-10 text-base md:text-lg font-sans relative z-10">
            Before launching a campaign, you must configure your Business Name
            and Sender Details in your settings.
          </p>
          <div className="relative z-10 w-full md:w-fit mx-auto">
            <PremiumButton
              onClick={() => (window.location.href = "/settings")}
              className="w-full md:w-auto"
            >
              Go to Settings
            </PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col w-full h-full max-w-7xl mx-auto pb-[24px] items-center justify-center min-h-[600px] px-4">
        <div className="text-center bg-[#131313] p-8 md:p-16 rounded-[4px] border border-white/5 shadow-2xl relative overflow-hidden w-full max-w-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-[#cafd00]/5 blur-[80px] pointer-events-none"></div>
          <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-[#cafd00] mx-auto mb-6 relative z-10" />
          <h2
            className="text-3xl md:text-4xl font-black tracking-tighter text-[#ffffff] mb-4 relative z-10"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Campaign Launched!
          </h2>
          <p className="text-[#adaaaa] mb-10 text-base md:text-lg font-sans relative z-10">
            Your campaign is securely queued and will run autonomously.
          </p>
          <div className="relative z-10 w-full md:w-fit mx-auto">
            <PremiumButton
              className="w-full md:w-auto"
              onClick={() => {
                setSuccess(false);
                setMode("bulk");
                setParsedData([]);
                setAiMessages([]);
                setAiContextBulk("");
                setManualTemplate(
                  "Hey {Name}! This is {Sender} from {Gym}. We'd love your feedback!",
                );
                setGenerationMode("AI Assist");
                setSelectedCustomerIndex(0);
              }}
            >
              Start New Campaign
            </PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full max-w-7xl mx-auto pb-[24px] relative">
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none w-[90%] md:w-auto ${channelWarning ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="bg-[#ff3333]/10 border border-[#ff3333]/30 text-[#ff3333] px-4 md:px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md justify-center">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-xs md:text-sm font-bold tracking-wide font-sans text-center">
            You must keep at least one channel active.
          </span>
        </div>
      </div>

      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 md:mb-16 gap-6 flex-wrap">
        <div className="min-w-0">
          <span className="text-[10px] text-[#cafd00] uppercase tracking-[0.2em] font-sans mb-2 block font-bold">
            Campaign Suite
          </span>
          <h1
            className="text-4xl md:text-6xl font-black tracking-tighter text-[#ffffff] truncate"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Templates
          </h1>
        </div>

        <div className="bg-[#131313] p-1.5 rounded-[4px] md:rounded-full flex gap-1 items-center w-full xl:w-auto overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 xl:flex-none px-4 md:px-6 py-2 text-xs md:text-sm rounded-[4px] md:rounded-full transition-all flex justify-center items-center whitespace-nowrap ${mode === "single" ? "bg-[#262626] text-[#ffffff] font-bold" : "text-[#adaaaa] hover:text-[#ffffff] font-medium"}`}
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Single Request
          </button>
          <button
            onClick={() => setMode("bulk")}
            className={`flex-1 xl:flex-none px-4 md:px-6 py-2 text-xs md:text-sm rounded-[4px] md:rounded-full transition-all flex justify-center items-center whitespace-nowrap ${mode === "bulk" ? "bg-[#262626] text-[#ffffff] font-bold" : "text-[#adaaaa] hover:text-[#ffffff] font-medium"}`}
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Bulk Upload
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12">
        <div className="xl:col-span-7 flex flex-col gap-8 md:gap-12 min-w-0">
          {mode === "single" ? (
            <section className="bg-[#131313] p-5 md:p-10 rounded-[4px] min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="flex flex-col gap-2 min-w-0">
                  <label
                    className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-3 md:py-4 text-base md:text-lg font-medium text-[#ffffff] placeholder:text-white/10 transition-all focus:border-[#f3ffca] focus:ring-0 font-sans"
                    placeholder="e.g. Marcus Aurelius"
                  />
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <label
                    className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-3 md:py-4 text-base md:text-lg font-medium text-[#ffffff] placeholder:text-white/10 transition-all focus:border-[#f3ffca] focus:ring-0 font-sans"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2 min-w-0">
                  <label
                    className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-3 md:py-4 text-base md:text-lg font-medium text-[#ffffff] placeholder:text-white/10 transition-all focus:border-[#f3ffca] focus:ring-0 font-sans"
                    placeholder="marcus@rome.com"
                  />
                </div>
              </div>
              <div className="mt-8 md:mt-12 flex flex-col gap-2 min-w-0">
                <label
                  className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  AI Message Context
                </label>
                <textarea
                  value={aiContextSingle}
                  onChange={(e) => setAiContextSingle(e.target.value)}
                  className="w-full bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-3 md:py-4 text-base md:text-lg font-medium text-[#ffffff] placeholder:text-white/10 resize-none transition-all focus:border-[#f3ffca] focus:ring-0 font-sans"
                  placeholder="Describe the goal..."
                  rows={3}
                ></textarea>
              </div>
              <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#262626] text-[#ffffff] text-sm font-bold rounded-[4px] border border-[#484847]/15 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shrink-0"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <Sparkles size={16} /> Generate Draft
                </button>
                <PremiumButton
                  className="w-full sm:w-auto px-8 md:px-12 uppercase tracking-tighter shrink-0"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Send Request
                </PremiumButton>
              </div>
            </section>
          ) : (
            <section className="flex flex-col gap-6 md:gap-12 min-w-0">
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFile(file);
                }}
                className="bg-[#131313] p-6 md:p-8 rounded-[4px] border-2 border-dashed border-[#484847]/30 flex flex-col items-center justify-center text-center group hover:bg-[#1a1a1a] transition-all cursor-pointer min-h-[160px] md:min-h-[200px] h-auto"
              >
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#262626] rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform shrink-0">
                  <UploadCloud
                    size={20}
                    className="text-[#cafd00] md:w-6 md:h-6"
                  />
                </div>
                <h3
                  className="text-[#ffffff] font-bold text-base md:text-lg px-4"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {parsedData.length > 0 ? (
                    "Upload Another CSV"
                  ) : (
                    <>
                      <span className="hidden lg:inline">Drag & Drop CSV</span>
                      <span className="inline lg:hidden leading-snug">
                        Click here to upload CSV
                      </span>
                    </>
                  )}
                </h3>

                {/* SURGICAL CUT 4: Conditional rendering for the visual error state */}
                {uploadError ? (
                  <p className="text-[#ff3333] text-xs md:text-sm mt-2 font-sans px-4 flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> {uploadError}
                  </p>
                ) : (
                  <p className="text-[#adaaaa] text-xs md:text-sm mt-2 font-sans px-4">
                    {parsedData.length > 0
                      ? `${parsedData.length} records parsed successfully`
                      : "Supported format: .csv with Name, Phone columns"}
                  </p>
                )}
              </label>

              <div className="bg-[#131313] p-5 md:p-10 rounded-[4px] flex flex-col gap-6 md:gap-8 min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      Active Profile
                    </label>
                    <div className="bg-[#0e0e0e] border border-[#484847]/30 rounded-[4px] px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center shrink-0">
                        <Building size={14} className="text-[#cafd00]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {businessName}
                        </span>
                        <span className="text-xs text-[#adaaaa] truncate">
                          Sending as {senderName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 min-w-0 md:pl-8 md:border-l md:border-[#484847]/30">
                    <label
                      className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      Active Channels
                    </label>
                    <div className="flex flex-wrap gap-6">
                      <div
                        className="flex items-center gap-3 cursor-pointer group shrink-0"
                        onClick={handleToggleEmail}
                      >
                        <div
                          className={`w-10 md:w-12 h-5 md:h-6 rounded-full transition-colors flex items-center px-1 ${isEmailEnabled ? "bg-[#cafd00]" : "bg-[#484847]/50"}`}
                        >
                          <div
                            className={`w-3.5 md:w-4 h-3.5 md:h-4 bg-white rounded-full transition-transform ${isEmailEnabled ? "translate-x-5 md:translate-x-6" : "translate-x-0"}`}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail
                            size={16}
                            className={
                              isEmailEnabled
                                ? "text-[#ffffff]"
                                : "text-[#adaaaa]"
                            }
                          />
                          <span
                            className={`text-sm font-bold ${isEmailEnabled ? "text-[#ffffff]" : "text-[#adaaaa]"}`}
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                            }}
                          >
                            Email
                          </span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-3 cursor-pointer group shrink-0"
                        onClick={handleToggleSms}
                      >
                        <div
                          className={`w-10 md:w-12 h-5 md:h-6 rounded-full transition-colors flex items-center px-1 ${isSmsEnabled ? "bg-[#cafd00]" : "bg-[#484847]/50"}`}
                        >
                          <div
                            className={`w-3.5 md:w-4 h-3.5 md:h-4 bg-white rounded-full transition-transform ${isSmsEnabled ? "translate-x-5 md:translate-x-6" : "translate-x-0"}`}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare
                            size={16}
                            className={
                              isSmsEnabled ? "text-[#ffffff]" : "text-[#adaaaa]"
                            }
                          />
                          <span
                            className={`text-sm font-bold ${isSmsEnabled ? "text-[#ffffff]" : "text-[#adaaaa]"}`}
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                            }}
                          >
                            SMS
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#131313] p-5 md:p-10 rounded-[4px] gap-6 md:gap-8 flex flex-col min-w-0">
                <div className="flex bg-[#0e0e0e] p-1 rounded-[4px] md:rounded-full w-full sm:w-fit overflow-x-auto shrink-0">
                  <button
                    onClick={() => setGenerationMode("AI Assist")}
                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2 text-xs md:text-sm rounded-[4px] md:rounded-full transition-all flex items-center justify-center whitespace-nowrap ${generationMode === "AI Assist" ? "bg-[#262626] text-[#ffffff] font-bold" : "text-[#adaaaa] hover:text-[#ffffff] font-medium"}`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    AI Assist
                  </button>
                  <button
                    onClick={() => setGenerationMode("Manual Template")}
                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2 text-xs md:text-sm rounded-[4px] md:rounded-full transition-all flex items-center justify-center whitespace-nowrap ${generationMode === "Manual Template" ? "bg-[#262626] text-[#ffffff] font-bold" : "text-[#adaaaa] hover:text-[#ffffff] font-medium"}`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Manual Template
                  </button>
                </div>

                {generationMode === "AI Assist" ? (
                  <div className="flex flex-col gap-2 min-w-0">
                    <label
                      className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      AI Message Context
                    </label>
                    <textarea
                      value={aiContextBulk}
                      onChange={(e) => setAiContextBulk(e.target.value)}
                      className="w-full bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-3 md:py-4 text-base md:text-lg font-medium text-[#ffffff] placeholder:text-white/10 resize-none transition-all focus:border-[#f3ffca] focus:ring-0 font-sans"
                      placeholder="Provide universal context..."
                      rows={3}
                    ></textarea>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 min-w-0">
                    <label
                      className="text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      Template Text
                    </label>
                    <textarea
                      value={manualTemplate}
                      onChange={(e) => setManualTemplate(e.target.value)}
                      className="w-full bg-[#0e0e0e] border-0 border-b border-[#484847]/30 py-3 md:py-4 text-base md:text-lg font-medium text-[#ffffff] placeholder:text-white/10 resize-none transition-all focus:border-[#f3ffca] focus:ring-0 font-sans"
                      placeholder="Type your precise message here..."
                      rows={3}
                    ></textarea>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button
                        onClick={() => insertPlaceholder("{Name}")}
                        className="px-3 py-1.5 bg-[#262626] text-[#adaaaa] rounded-[4px] text-xs font-bold font-sans hover:text-white hover:bg-[#333] transition-colors border border-[#484847]/30 shrink-0"
                      >
                        Insert {"{Name}"}
                      </button>
                      <button
                        onClick={() => insertPlaceholder("{Sender}")}
                        className="px-3 py-1.5 bg-[#262626] text-[#adaaaa] rounded-[4px] text-xs font-bold font-sans hover:text-white hover:bg-[#333] transition-colors border border-[#484847]/30 shrink-0"
                      >
                        Insert {"{Sender}"}
                      </button>
                      <button
                        onClick={() => insertPlaceholder("{Gym}")}
                        className="px-3 py-1.5 bg-[#262626] text-[#adaaaa] rounded-[4px] text-xs font-bold font-sans hover:text-white hover:bg-[#333] transition-colors border border-[#484847]/30 shrink-0"
                      >
                        Insert {"{Gym}"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 md:mt-8 flex justify-end">
                  <button
                    onClick={handleGenerateMessages}
                    disabled={
                      isLoading ||
                      parsedData.length === 0 ||
                      (generationMode === "AI Assist"
                        ? !aiContextBulk
                        : !manualTemplate)
                    }
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[#262626] text-[#ffffff] text-sm font-bold rounded-[4px] border border-[#484847]/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    {isLoading ? "Generating..." : "Generate Messages"}
                  </button>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-4 md:p-8 rounded-[4px] min-w-0">
                <div className="flex justify-between items-center mb-6">
                  <h3
                    className="font-bold text-lg md:text-xl text-[#ffffff] truncate"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    Queue
                  </h3>
                  <span className="text-[10px] text-[#cafd00] uppercase tracking-widest font-bold whitespace-nowrap ml-2">
                    {parsedData.length} Parsed
                  </span>
                </div>

                <div className="flex flex-col space-y-3 max-h-[400px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                  {aiMessages.length > 0 ? (
                    aiMessages.map((row, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedCustomerIndex(idx)}
                        className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-[#262626] rounded-[4px] border border-[#484847]/30 cursor-pointer transition-colors gap-3 md:gap-0 ${selectedCustomerIndex === idx ? "!border-[#cafd00] bg-[#2e2e2e]" : ""}`}
                      >
                        <div className="flex items-center gap-[12px] w-full md:w-1/4 min-w-0">
                          <User size={16} className="text-[#adaaaa] shrink-0" />
                          <div className="flex flex-col min-w-0 w-full">
                            <span className="text-sm font-bold text-[#ffffff] font-sans truncate block w-full">
                              {row.customer.name}
                            </span>
                            <span className="text-[10px] text-[#adaaaa] font-sans truncate block w-full">
                              {row.customer.phone || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="w-full md:w-3/4 md:pl-6 min-w-0">
                          <textarea
                            className="w-full text-xs md:text-[12px] text-[#ffffff] bg-transparent border-0 border-l-2 border-[#484847]/30 pl-3 md:pl-4 py-1 resize-none focus:outline-none focus:border-[#cafd00] font-sans italic custom-scrollbar block"
                            value={row.message}
                            onChange={(e) =>
                              handleMessageEdit(idx, e.target.value)
                            }
                            rows={Math.max(2, row.message.split("\n").length)}
                          />
                        </div>
                      </div>
                    ))
                  ) : parsedData.length > 0 ? (
                    parsedData.map((row, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedCustomerIndex(idx)}
                        className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-[#262626] rounded-[4px] border border-[#484847]/30 cursor-pointer transition-colors gap-3 md:gap-0 ${selectedCustomerIndex === idx ? "!border-[#cafd00] bg-[#2e2e2e]" : ""}`}
                      >
                        <div className="flex items-center gap-[12px] w-full md:w-1/4 min-w-0">
                          <User size={16} className="text-[#adaaaa] shrink-0" />
                          <div className="flex flex-col min-w-0 w-full">
                            <span className="text-sm font-bold text-[#ffffff] font-sans truncate block w-full">
                              {row.name}
                            </span>
                            <span className="text-[10px] text-[#adaaaa] font-sans truncate block w-full">
                              {row.phone || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="w-full md:w-3/4 md:pl-6 min-w-0">
                          <p className="text-xs md:text-[12px] text-[#adaaaa] font-sans italic border-l-2 border-[#484847]/30 pl-3 md:pl-4 py-1 truncate">
                            Waiting for generation...
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#adaaaa] font-sans text-sm px-4">
                      Upload a CSV to view the preview queue.
                    </div>
                  )}
                </div>

                <div className="mt-6 md:mt-8 flex justify-end">
                  <div
                    className="w-full sm:w-auto"
                    onClick={(e) => {
                      if (isSaving || aiMessages.length === 0)
                        e.preventDefault();
                    }}
                  >
                    <PremiumButton
                      onClick={handleLaunchCampaign}
                      disabled={isSaving || aiMessages.length === 0}
                      className={`w-full sm:w-auto px-8 md:px-12 py-3 md:py-4 uppercase tracking-tighter shrink-0 ${isSaving || aiMessages.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      {isSaving ? "Launching..." : "Launch Campaign"}
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="xl:col-span-5 relative mt-8 xl:mt-0 min-w-0">
          <div className="sticky top-4 md:top-12">
            <div className="hidden md:block absolute -top-12 -right-12 w-64 h-64 bg-[#cafd00]/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="bg-[#262626]/60 backdrop-blur-[40px] p-5 md:p-8 rounded-[4px] border border-white/5 relative overflow-hidden shadow-xl min-w-0">
              <div className="flex flex-col items-center mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#262626] rounded-full flex items-center justify-center mb-2">
                  <User size={18} className="text-[#adaaaa]" />
                </div>
                <span
                  className="text-[10px] font-bold text-[#adaaaa] tracking-widest uppercase text-center"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Message Preview
                </span>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col gap-1 items-start min-w-0 w-full">
                  <div className="bg-[#262626] px-4 md:px-5 py-2.5 md:py-3 rounded-[16px] rounded-bl-sm max-w-[90%] md:max-w-[85%] break-words">
                    <p className="text-xs md:text-sm text-[#ffffff] leading-relaxed font-sans">
                      Hey{" "}
                      {mode === "single"
                        ? name || "Marcus"
                        : aiMessages[selectedCustomerIndex]?.customer.name ||
                          parsedData[selectedCustomerIndex]?.name ||
                          "Marcus"}
                      ! This is {senderName} from {businessName}.
                    </p>
                  </div>
                  <span className="text-[10px] text-[#adaaaa] ml-2 font-sans">
                    10:42 AM
                  </span>
                </div>

                <div className="flex flex-col gap-1 items-start min-w-0 w-full">
                  <div className="bg-[#262626] px-4 md:px-5 py-2.5 md:py-3 rounded-[16px] rounded-bl-sm max-w-[90%] md:max-w-[85%] border-l-2 border-[#cafd00] break-words">
                    <p className="text-xs md:text-sm text-[#ffffff] leading-relaxed font-sans">
                      {mode === "single"
                        ? aiContextSingle ||
                          "I saw you crushed your PR yesterday. Ready to take on the Saturday HIIT challenge? 🔥"
                        : aiMessages[selectedCustomerIndex]?.message ||
                          (generationMode === "Manual Template"
                            ? manualTemplate
                                .replace(
                                  /{Name}/g,
                                  parsedData[selectedCustomerIndex]?.name ||
                                    "Marcus",
                                )
                                .replace(/{Sender}/g, senderName || "{Sender}")
                                .replace(/{Gym}/g, businessName || "{Gym}")
                            : aiContextBulk ||
                              "Did you know you're one of our top members this month? Drop us a review! [REVIEW_LINK] 🌟")}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#adaaaa] ml-2 font-sans">
                    Just now
                  </span>
                </div>

                <div className="pt-6 md:pt-8 border-t border-white/5 mt-6 md:mt-8 min-w-0 w-full">
                  <div className="flex items-center gap-3 bg-[#0e0e0e]/50 px-3 md:px-4 py-2.5 md:py-3 rounded-full border border-white/5">
                    <div className="flex-1 text-[10px] md:text-xs text-[#adaaaa] font-sans truncate">
                      Type a message...
                    </div>
                    <Send size={14} className="text-[#cafd00] shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 flex gap-4 overflow-hidden px-2 md:px-0">
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
