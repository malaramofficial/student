"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../mode-toggle";

const pageTitles: { [key: string]: string } = {
  "/": "डैशबोर्ड",
  "/mock-tests": "मॉक टेस्ट",
  "/progress-tracker": "प्रगति ट्रैकर",
  "/ai-teacher": "एआई वर्चुअल शिक्षक",
  "/speech-generator": "भाषण जनरेटर",
  "/admin": "एडमिन पैनल",
  "/results": "परीक्षा परिणाम",
};

export function Header() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const title = pageTitles[pathname] || "अदिति लर्निंग प्लेटफॉर्म";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className={cn("md:hidden", { "invisible": !isMobile })}>
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold md:text-xl font-headline">{title}</h1>
      <div className="ml-auto md:hidden">
        <ModeToggle />
      </div>
    </header>
  );
}
