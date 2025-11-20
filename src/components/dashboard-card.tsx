import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

type DashboardCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function DashboardCard({ href, icon, title, description }: DashboardCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 hover:border-primary">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          {icon}
          <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </CardHeader>
        <CardHeader>
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
