import { cn } from "@/lib/utils";

export type Tier =
  | "챌린저"
  | "그랜드마스터"
  | "마스터"
  | "다이아몬드"
  | "에메랄드"
  | "플래티넘"
  | "골드"
  | "실버"
  | "브론즈"
  | "아이언"
  | "언랭크"
  | "미공개";

interface TierBadgeProps {
  label: string;
  tier: Tier;
  className?: string;
}

const tierConfig: Record<Tier, { color: string; bg: string; anim?: string; border?: string }> = {
  "챌린저": { color: "#00f0ff", bg: "rgba(0, 240, 255, 0.12)", anim: "tier-anim-challenger", border: "rgba(0, 240, 255, 0.5)" },
  "그랜드마스터": { color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", anim: "tier-anim-grandmaster", border: "rgba(239, 68, 68, 0.5)" },
  "마스터": { color: "#c084fc", bg: "rgba(192, 132, 252, 0.15)", border: "rgba(192, 132, 252, 0.3)" },
  "다이아몬드": { color: "#0284c7", bg: "rgba(2, 132, 199, 0.12)", border: "rgba(2, 132, 199, 0.3)" },
  "에메랄드": { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" },
  "플래티넘": { color: "#2dd4bf", bg: "rgba(45, 212, 191, 0.15)", border: "rgba(45, 212, 191, 0.3)" },
  "골드": { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)", border: "rgba(251, 191, 36, 0.3)" },
  "실버": { color: "#a1a1aa", bg: "rgba(161, 161, 170, 0.15)", border: "rgba(161, 161, 170, 0.3)" },
  "브론즈": { color: "#b45309", bg: "rgba(180, 83, 9, 0.15)", border: "rgba(180, 83, 9, 0.3)" },
  "아이언": { color: "#78716c", bg: "rgba(120, 113, 108, 0.15)", border: "rgba(120, 113, 108, 0.3)" },
  "언랭크": { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.3)" },
  // Server marks privacy-locked characters with this tier label; we render a neutral, slightly muted slate badge.
  "미공개": { color: "#cbd5e1", bg: "rgba(100, 116, 139, 0.18)", border: "rgba(148, 163, 184, 0.4)" },
};

function getShortTierName(tier: string) {
  if (tier === "그랜드마스터") return "그마";
  if (tier === "다이아몬드") return "다이아";
  if (tier === "에메랄드") return "에메";
  if (tier === "플래티넘") return "플래";
  if (tier === "미공개") return "비공개";
  return tier;
}

export function TierBadge({ label, tier, className }: TierBadgeProps) {
  const config = tierConfig[tier] || tierConfig["언랭크"];
  const shortTier = getShortTierName(tier);
  
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded px-1.5 py-[1px] border font-bold leading-tight shrink-0",
        config.anim,
        className
      )}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.color,
      }}
      title={`${label} - ${tier}`}
    >
      <span className="opacity-70 text-[9px] uppercase tracking-wider">{label}</span>
      <span className="text-[11px] text-shadow-meter">{shortTier}</span>
    </div>
  );
}
