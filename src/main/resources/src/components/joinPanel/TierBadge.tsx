import { cn } from "@/lib/utils";

export type Tier = "S" | "A" | "B" | "C" | "Unranked";

interface TierBadgeProps {
  label: string;
  tier: Tier;
  className?: string;
}

const tierColors: Record<Tier, string> = {
  S: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-400/50 shadow-[0_0_10px_rgba(245,158,11,0.4)]",
  A: "bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white border-purple-400/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]",
  B: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400/50",
  C: "bg-gradient-to-r from-slate-500 to-gray-600 text-white border-slate-400/50",
  Unranked: "bg-zinc-700/80 text-zinc-300 border-zinc-600/50",
};

export function TierBadge({ label, tier, className }: TierBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded px-2 py-0.5 border text-[10px] font-bold leading-tight shrink-0",
        tierColors[tier],
        className
      )}
      title={`${label} - ${tier}`}
    >
      <span className="opacity-80 text-[8px] uppercase tracking-wider -mb-0.5">{label}</span>
      <span className="text-sm text-shadow-meter">{tier}</span>
    </div>
  );
}
