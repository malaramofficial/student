"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, Bot, ClipboardCheck, Home, LineChart, Lock, AudioLines } from "lucide-react";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "डैशबोर्ड", icon: Home },
  { href: "/mock-tests", label: "मॉक टेस्ट", icon: ClipboardCheck },
  { href: "/progress-tracker", label: "प्रगति ट्रैकर", icon: LineChart },
  { href: "/ai-teacher", label: "एआई शिक्षक", icon: Bot },
  { href: "/text-to-speech", label: "टेक्स्ट-टू-स्पीच", icon: AudioLines },
  { href: "/admin", label: "एडमिन", icon: Lock },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <BookOpenCheck className="w-7 h-7 text-primary" />
          <span className="font-bold text-lg font-headline text-primary-foreground group-data-[collapsible=icon]:hidden">
            अदिति लर्निंग
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, className: 'bg-sidebar-background text-sidebar-foreground border-sidebar-border' }}
                  className={cn(
                    "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
