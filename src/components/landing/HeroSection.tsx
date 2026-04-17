import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp } from "lucide-react"; // Swapped to Lucide

export function HeroSection() {
  return (
    <section className="relative min-h-[921px] flex flex-col items-center justify-center px-6 lg:px-24">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center z-10 p-4">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-high rounded-full border border-outline-variant/15">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-display text-[10px] uppercase tracking-widest text-primary">
              Performance First
            </span>
          </div>
          <h1 className="leading-[0.95] tracking-[-0.04em] font-display font-black text-5xl md:text-7xl lg:text-8xl text-white">
            The Most Profitable 30 Seconds in Your Gym's Day.
          </h1>
          <p className="font-sans text-xl text-on-surface-variant max-w-lg leading-relaxed">
            Turn your members' workout highs into a 24/7 sales engine. Rank #1
            on Google, drive more walk-ins, and grow your MRR on autopilot—no ad
            spend required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/sign-up"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Start Growing My Gym
              {/* Replaced Material icon with Lucide */}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="bg-surface-high text-white px-8 py-4 rounded-lg font-bold text-lg border border-outline-variant/15 hover:bg-surface-bright transition-colors">
              Watch Demo
            </button>
          </div>
        </div>

        <div className="relative group mt-10 lg:mt-0">
          <div className="absolute -inset-4 bg-primary/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative bg-surface rounded-xl p-4 border border-outline-variant/15 shadow-2xl">
            <img
              alt="RepFit Dashboard"
              className="rounded-lg shadow-inner grayscale-[0.2] contrast-125 w-full h-auto object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZF5bgD5_JT8YsXV5DG55X3hKjIHLb2LJXwUU2xCWJwSh80XZ48KTj1aiwq4jLN8ZNggC20oTf7upx6mWM0g_I99eOhZrJCCYKlYvfbXvWSPpbaUHilWFpKpvvMS4rlMwxTu0UYlFtcpvMTCz5jzv6LK_huFhZY1jCSU5bNDrAOyV4siTouYwSf9w02rDJpY1c1hOhcsu5K4_-H5vRggDdjgZ40Vd_Pv_7_OmUVhqQJ9TFsSTqgs-GrmKfdTav3rMYvoG_u_980I"
            />
            {/* Floating KPI Cards */}
            <div className="absolute -bottom-6 -left-6 bg-surface-highest p-6 rounded-lg border border-outline-variant/15 shadow-xl hidden md:block">
              <div className="text-primary text-4xl font-black font-display">
                98%
              </div>
              <div className="text-xs uppercase tracking-widest font-display text-white/50">
                Retention Rate
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-primary p-6 rounded-lg shadow-xl hidden md:block">
              {/* Replaced Material icon with Lucide */}
              <TrendingUp className="text-primary-foreground w-10 h-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
