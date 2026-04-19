import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-surface-low w-full py-12 px-8 border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xl font-black text-white font-display">RepFit</div>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 font-sans text-xs text-white/50">
          <Link
            href="#"
            className="text-white/40 hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-white/40 hover:text-primary transition-colors"
          >
            Terms of Service
          </Link>
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>{" "}
          {/* Divider */}
          <Link
            href="#"
            className="text-white/40 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            Contact
          </Link>
          <Link
            href="#"
            className="text-white/40 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            Instagram
          </Link>
          <Link
            href="#"
            className="text-white/40 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            LinkedIn
          </Link>
        </div>

        <div className="font-sans text-xs text-white/50 text-center md:text-right">
          © {new Date().getFullYear()} RepFit. Performance First.
        </div>
      </div>
    </footer>
  );
}
