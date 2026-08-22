import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  positive: "bg-primary/15 text-primary",
  info: "bg-accent/15 text-accent",
  warning: "bg-warning/15 text-warning",
  critical: "bg-danger/15 text-danger",
  neutral: "bg-border text-muted",
};

export function Badge({ tone = "neutral", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: string }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[tone] ?? styles.neutral, className)}
      {...props}
    />
  );
}
