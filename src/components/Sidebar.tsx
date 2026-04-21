import Link from "next/link";
import { LayoutDashboard, Target, Settings, Zap } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 h-screen shrink-0 flex flex-col bg-[#131313] border-r border-white/5">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[#cafd00] flex items-center justify-center text-[#131313]">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h1 className="font-sans font-bold uppercase tracking-widest text-lg text-white">
            RepFit
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {[
          { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
          { icon: Target, label: "Campaigns", href: "/request" },
          { icon: Settings, label: "Settings", href: "/settings" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 px-4 py-3 rounded-sm text-sm font-sans font-medium text-[#adaaaa] hover:bg-[#262626] hover:text-[#ffffff] transition-all group"
          >
            <item.icon className="w-4 h-4 group-hover:text-[#cafd00] transition-colors" />
            <span className="uppercase tracking-wider text-[0.6875rem] font-bold">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
