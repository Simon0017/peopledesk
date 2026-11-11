import { cn } from "@/lib/cn";
import { APP_NAME } from "@/lib/constants";

export function Logo({ hideTextOnDesktop = false }) {
  return (
    <span className="flex items-center gap-2 font-semibold">
      <img
        src="/pd-logo.png"
        alt={`${APP_NAME} logo`}
        className="h-8 w-8 rounded-lg object-contain"
      />

      <span className={cn(hideTextOnDesktop && "lg:sr-only")}>
        {APP_NAME}
      </span>
    </span>
  );
}