"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageTitles: { [key: string]: string } = {
  "/": "Dashboard",
  "/mock-tests": "Mock Tests",
  "/progress-tracker": "Progress Tracker",
  "/ai-teacher": "AI Virtual Teacher",
  "/text-to-speech": "Text-to-Speech Utility",
  "/admin": "Admin Panel",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Aditi Learning Platform";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold md:text-xl font-headline">{title}</h1>
    </header>
  );
}
