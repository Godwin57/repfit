import Link from "next/link";
import { SearchCheck, BadgeCheck, Zap } from "lucide-react";

export function RoiSection() {
  return (
    <section className="py-32 px-6 lg:px-24 bg-surface-low">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
          <div className="max-w-2xl">
            <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-6">
              Designed for Growth. Built for Performance.
            </h2>
            <p className="text-on-surface-variant font-sans text-lg">
              We stripped away the complexity of traditional CRM systems to
              focus on the three pillars that actually move the needle for gym
              owners.
            </p>
          </div>
          <span className="font-display text-primary text-sm uppercase tracking-tighter border-b border-primary pb-2">
            ROI Focused / 01
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Glassmorphic Card 1 */}
          <div className="group relative bg-surface-variant/60 backdrop-blur-xl p-10 rounded-lg border border-outline-variant/15 hover:bg-surface-bright/80 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              {/* Replaced Material icon with Lucide */}
              <SearchCheck className="text-primary w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-4">
              Rank Higher.
            </h3>
            <p className="text-on-surface-variant leading-relaxed font-sans">
              Dominate local search results and be the first gym people see when
              they search for fitness in your city.
            </p>
          </div>

          {/* Glassmorphic Card 2 */}
          <div className="group relative bg-surface-variant/60 backdrop-blur-xl p-10 rounded-lg border border-outline-variant/15 hover:bg-surface-bright/80 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              {/* Replaced Material icon with Lucide */}
              <BadgeCheck className="text-primary w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-4">
              Get Chosen.
            </h3>
            <p className="text-on-surface-variant leading-relaxed font-sans">
              Show off stellar member reviews and build instant trust with
              prospects. RepFit automates social proof while it's hot.
            </p>
          </div>

          {/* Glassmorphic Card 3 */}
          <div className="group relative bg-surface-variant/60 backdrop-blur-xl p-10 rounded-lg border border-outline-variant/15 hover:bg-surface-bright/80 transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              {/* Replaced Material icon with Lucide */}
              <Zap className="text-primary w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-4">
              Close Faster.
            </h3>
            <p className="text-on-surface-variant leading-relaxed font-sans">
              Convert leads into loyal members with high-performance follow-up
              tools that feel like concierge service.
            </p>
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link
            href="/sign-up"
            className="inline-block bg-primary text-primary-foreground px-12 py-5 rounded-lg font-black text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(202,253,0,0.2)]"
          >
            Start Growing My Gym
          </Link>
        </div>
      </div>
    </section>
  );
}
