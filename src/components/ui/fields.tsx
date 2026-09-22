import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

export function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-medium text-[#3f3a34]", className)}>
      {children}
    </label>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-[#6b645c]">{children}</p>;
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-[#d9d1c5] bg-white px-3 text-sm text-[#161513] outline-none transition placeholder:text-[#9a9389] focus:border-[#1f4a45] focus:ring-2 focus:ring-[#1f4a45]/15",
        className
      )}
      {...props}
    />
  );
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-[#d9d1c5] bg-white px-3 py-2 text-sm outline-none transition placeholder:text-[#9a9389] focus:border-[#1f4a45] focus:ring-2 focus:ring-[#1f4a45]/15",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-[#d9d1c5] bg-white px-3 text-sm outline-none focus:border-[#1f4a45] focus:ring-2 focus:ring-[#1f4a45]/15",
        className
      )}
      {...props}
    />
  );
}
