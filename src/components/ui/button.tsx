import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f4a45]",
        variant === "primary" && "bg-[#1f4a45] text-[#f6f1e8] hover:bg-[#173833]",
        variant === "secondary" && "bg-[#161513] text-[#f6f1e8] hover:bg-black",
        variant === "ghost" && "bg-transparent text-[#161513] hover:bg-black/5",
        variant === "outline" && "border border-[#d9d1c5] bg-white/70 hover:bg-white",
        variant === "danger" && "bg-[#8a2f2b] text-white hover:bg-[#732623]",
        size === "sm" && "h-8 rounded-md px-3 text-sm",
        size === "md" && "h-10 rounded-lg px-4 text-sm",
        size === "lg" && "h-12 rounded-xl px-5",
        className
      )}
      {...props}
    />
  );
}
