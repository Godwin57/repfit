import Link from 'next/link';
import { LayoutDashboard, MessageSquareText, Target, Settings, Zap } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 h-full shrink-0 flex flex-col bg-[var(--color-surface-low)] border-r border-outline-variant/15">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center text-primary-foreground">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h1 className="font-display font-bold uppercase tracking-widest text-lg">RepFit</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {[
          { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
          { icon: Target, label: 'SEO Metrics', href: '/seo' },
          { icon: MessageSquareText, label: 'Reviews', href: '/reviews' },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 px-4 py-3 rounded-sm text-sm font-sans font-medium text-surface-variant hover:bg-[var(--color-surface-highest)] hover:text-foreground transition-all group"
          >
            <item.icon className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
            <span className="text-outline group-hover:text-foreground uppercase tracking-wider text-[0.6875rem]">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <div className="p-4">
         <Link
            href="/settings"
            className="flex items-center gap-4 px-4 py-3 rounded-sm text-sm font-sans font-medium text-surface-variant hover:bg-[var(--color-surface-highest)] transition-all group"
          >
            <Settings className="w-4 h-4 text-outline group-hover:text-foreground transition-colors" />
            <span className="text-outline uppercase tracking-wider text-[0.6875rem] group-hover:text-foreground">Settings</span>
          </Link>
      </div>
    </aside>
  );
}
