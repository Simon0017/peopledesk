import { Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar({ onOpenMobileNav }) {
  const isScrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur sm:px-6 lg:px-8",
        isScrolled && "shadow-sm",
      )}
    >
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" onClick={onOpenMobileNav}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
