import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0e0e0e]">
      {/* Sidebar fixed to the left of the viewport */}
      <Sidebar />

      {/* Main content area that scrolls independently */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 py-10 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
