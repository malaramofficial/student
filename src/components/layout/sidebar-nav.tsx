'use client';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  BotMessageSquare,
  ClipboardList,
  Home,
  BookOpen,
  GraduationCap,
  Speech,
  FileText,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SidebarNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold font-headline">AI सहायक</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              href="/"
              isActive={isActive('/')}
              tooltip="मुखपृष्ठ"
            >
              <Home />
              <span>मुखपृष्ठ</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>अध्ययन सामग्री</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                href="/ai-teacher"
                isActive={isActive('/ai-teacher')}
                tooltip="एआई गुरु"
              >
                <BotMessageSquare />
                <span>एआई गुरु</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                href="/syllabus"
                isActive={isActive('/syllabus')}
                tooltip="पाठ्यक्रम"
              >
                <BookOpen />
                <span>पाठ्यक्रम</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                href="/text-to-speech"
                isActive={isActive('/text-to-speech')}
                tooltip="टेक्स्ट-टू-स्पीच"
              >
                <Speech />
                <span>टेक्स्ट-टू-स्पीच</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>मूल्यांकन</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                href="/mock-tests"
                isActive={isActive('/mock-tests')}
                tooltip="मॉक टेस्ट"
              >
                <ClipboardList />
                <span>मॉक टेस्ट</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                href="/written-exam"
                isActive={isActive('/written-exam')}
                tooltip="लिखित परीक्षा"
              >
                <FileText />
                <span>लिखित परीक्षा</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                href="/results"
                isActive={isActive('/results')}
                tooltip="परिणाम"
              >
                <GraduationCap />
                <span>परिणाम</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
