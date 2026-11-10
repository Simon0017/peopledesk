import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function Spinner({ className }) {
  return <LoaderCircle className={cn("h-5 w-5 animate-spin", className)} aria-hidden="true" />;
}
