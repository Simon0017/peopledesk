import { Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/constants";

export function Logo({ hideTextOnDesktop = false }) {
  return (
    <span className="flex items-center gap-2 font-semibold">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <Users className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className={cn(hideTextOnDesktop && "lg:sr-only")}>{APP_NAME}</span>
    </span>
  );
}
