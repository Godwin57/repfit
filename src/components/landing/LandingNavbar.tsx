import Link from "next/link";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-xl shadow-[0_0_32px_rgba(255,255,255,0.04)] flex justify-between items-center px-8 py-4 max-w-full mx-auto">
      <div className="text-2xl font-black tracking-tighter text-foreground">
        RepFit
      </div>

      <div className="hidden md:flex items-center gap-8 font-display font-bold uppercase tracking-wider text-sm">
        <Link
          className="text-foreground/70 hover:text-foreground transition-colors"
          href="#features"
        >
          Features
        </Link>
        <Link
          className="text-foreground/70 hover:text-foreground transition-colors"
          href="#pricing"
        >
          Pricing
        </Link>
        <Link
          className="text-foreground/70 hover:text-foreground transition-colors"
          href="#case-studies"
        >
          Case Studies
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* State 1: User is Logged Out */}
        <Show when="signed-out">
          {/* Clerk allows you to pass a custom button inside SignInButton */}
          <SignInButton mode="modal">
            <button className="text-foreground/80 font-bold hover:text-primary transition-colors px-4 py-2 text-sm">
              Log In
            </button>
          </SignInButton>
          <Link
            href="/sign-up"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Show>

        {/* State 2: User is Logged In */}
        <Show when="signed-in">
          <Link
            href="/request"
            className="bg-surface-high text-white px-5 py-2 rounded-lg font-bold text-sm border border-outline-variant/15 hover:bg-surface-bright transition-colors flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Dashboard
          </Link>
          <div className="ml-2 pl-2 border-l border-white/10 flex items-center">
            {/* Clerk's built-in profile management dropdown */}
            <UserButton />
          </div>
        </Show>
      </div>
    </nav>
  );
}
