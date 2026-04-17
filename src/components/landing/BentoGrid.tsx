import { Star, Rocket } from "lucide-react";

export function BentoGrid() {
  return (
    <section className="py-32 px-6 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 min-h-[600px]">
          {/* Box 1 */}
          <div className="md:col-span-2 bg-surface rounded-lg p-10 flex flex-col justify-between border border-outline-variant/15">
            <div>
              <h4 className="font-display font-bold text-3xl mb-4 text-white">
                Real-Time Growth Analytics
              </h4>
              <p className="text-on-surface-variant font-sans">
                See every dollar and review as it comes in. No more guessing
                what works.
              </p>
            </div>
            <div className="pt-8">
              <div className="h-2 w-full bg-surface-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4"></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] uppercase font-display tracking-widest text-on-surface-variant">
                <span>Current Target</span>
                <span className="text-primary">75% Complete</span>
              </div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="md:col-span-2 bg-surface-high rounded-lg overflow-hidden border border-outline-variant/15 relative">
            <img
              alt="Gym Performance"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVsH_ymh9UMG7s57zaQZaP2nqzffLuR8HFpRrm2gU0amwCG7508tQw9raTRZ6K4pI0qX5x4ewx3sunPZyzb0P7BDlHZXFkAWV4tmwcQV8ZHoMRvU5crpzNb9JsSj9ncO95iN8miCBEUu7RRBA3VwUyqrhyLBOmPFQDff5qLHHe2kKUG_a-FCoKOtTyvB3e6as82koRCpKknMYX_91dxU__DK09-HAxP6pE_gGQbdU27purtxPVIqxR0QsCox2143CW_Dv0LeU_pgs"
            />
            <div className="relative z-10 p-10 h-full flex flex-col justify-end bg-gradient-to-t from-background to-transparent">
              <h4 className="font-display font-bold text-3xl mb-2 text-white">
                Automated Outreach
              </h4>
              <p className="text-on-surface-variant font-sans">
                Engage leads before they cool down.
              </p>
            </div>
          </div>

          {/* Box 3 */}
          <div className="bg-surface rounded-lg p-8 border border-outline-variant/15 flex flex-col items-center justify-center text-center">
            {/* Swapped to Lucide with fill applied */}
            <Star className="text-primary w-12 h-12 mb-4 fill-current" />
            <div className="text-2xl font-black font-display text-white">
              500+
            </div>
            <p className="text-xs font-display uppercase text-on-surface-variant">
              Gyms Thriving
            </p>
          </div>

          {/* Box 4 */}
          <div className="bg-surface rounded-lg p-8 border border-outline-variant/15 flex flex-col items-center justify-center text-center">
            {/* Swapped to Lucide */}
            <Rocket className="text-primary w-12 h-12 mb-4" />
            <div className="text-2xl font-black font-display text-white">
              12x
            </div>
            <p className="text-xs font-display uppercase text-on-surface-variant">
              Avg ROI
            </p>
          </div>

          {/* Box 5 */}
          <div className="md:col-span-2 bg-surface rounded-lg p-10 border border-outline-variant/15 flex items-center gap-8 flex-col sm:flex-row text-center sm:text-left">
            <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
              <img
                alt="Gym Owner"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpG6lWY_9odSfppumJqdHl2eVJoaeXoMNeQ7wZ0cDyqxBRB2lfTft55MGllWHpqfOiJcYLMPfhN9HMVnhAvsCuAzvQwPcLVtyy00q_V6PdOEjH0j-Y9Ip1QfzSw_lYc6oD3sFFeJKUpOfGnq3MhYlqJc5pr3SBIZIsPMZUJ-uC5Dvr4tlyJ2ZrmLxRL3I_kwrEpZITjtFZwGeeJ4azQ38jMdETk9_Ok4BG-uIGhx8FqgGhU4IBwnG7wmMPPh74U6xSO69w1Z7KKsA"
              />
            </div>
            <div>
              <p className="italic text-lg text-white mb-2 font-sans">
                "RepFit is the single most important tool in my tech stack."
              </p>
              <p className="font-display uppercase text-xs tracking-widest text-primary">
                Alex Rivers, Iron Haven Gym
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
