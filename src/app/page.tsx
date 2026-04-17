import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { RoiSection } from '@/components/landing/RoiSection';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      <LandingNavbar />
      
      <main className="pt-24 overflow-hidden">
        <HeroSection />
        <RoiSection />
        <BentoGrid />
      </main>

      <LandingFooter />
    </div>
  );
}
