import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-[#e6e0d6] bg-[#fffcf7] shadow-[0_1px_0_rgba(22,21,19,0.04)]", className)}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warn" | "danger" | "info" }) {
  const tones = {
    neutral: "bg-[#efeae2] text-[#4a453e]",
    success: "bg-[#e3eee8] text-[#1f4a45]",
    warn: "bg-[#f4ead4] text-[#7a5b1e]",
    danger: "bg-[#f3e2df] text-[#8a2f2b]",
    info: "bg-[#e4eaf1] text-[#2f4a68]",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d9d1c5] bg-white/50 px-6 py-16 text-center">
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#6b645c]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[#6b645c]" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d9d1c5] border-t-[#1f4a45]" />
      {label}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
          {title}
        </h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-[#6b645c]">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#e8c9c4] bg-[#f8ecea] px-4 py-3 text-sm text-[#8a2f2b]" role="alert">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#cfe0d8] bg-[#eef6f2] px-4 py-3 text-sm text-[#1f4a45]" role="status">
      {message}
    </div>
  );
}
