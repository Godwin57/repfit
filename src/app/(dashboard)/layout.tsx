"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e0e0e] text-white">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-surface-low)] border-r border-[var(--color-outline-variant)] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col md:bg-transparent md:border-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-low)]">
          <Link href={"/"}>
            <span className="font-bold text-lg text-[var(--color-primary)]">
              RepFit
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-[var(--color-on-surface-variant)] hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--color-outline-variant)] sticky top-0 z-10 bg-[#131313]/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <Link href="/">
              <div className="font-bold text-lg text-white">RepFit</div>
            </Link>
          </div>
          <UserButton />
        </header>

        <div className="hidden md:flex justify-end absolute top-6 right-8 z-10">
          <UserButton />
        </div>

        <div className="mx-auto max-w-7xl px-8 lg:px-12 py-10 w-full mt-12 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
