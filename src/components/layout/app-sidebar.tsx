"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, Bot, ClipboardCheck, FileText, Home, LineChart, Lock, MicVocal } from "lucide-react";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../mode-toggle";

const menuItems = [
  { href: "/", label: "डैशबोर्ड", icon: Home },
  { href: "/ai-teacher", label: "एआई शिक्षक", icon: Bot },
  { href: "/mock-tests", label: "मॉक टेस्ट", icon: ClipboardCheck },
  { href: "/results", label: "परीक्षा परिणाम", icon: FileText },
  { href: "/progress-tracker", label: "प्रगति ट्रैकर", icon: LineChart },
  { href: "/speech-generator", label: "भाषण जनरेटर", icon: MicVocal },
  { href: "/admin", label: "एडमिन", icon: Lock },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <BookOpenCheck className="w-8 h-8 text-sidebar-primary" />
          <span className="font-bold text-xl font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            अदिति लर्निंग
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                as={Link}
                href={item.href}
                isActive={pathname === item.href}
                tooltip={{ children: item.label, className: 'bg-sidebar-background text-sidebar-foreground border-sidebar-border' }}
                className={cn(
                  "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="items-center group-data-[collapsible=icon]:-ml-2">
        <ModeToggle />
      </SidebarFooter>
    </>
  );
}
