import { Shield, Sword, Sparkles, Beaker } from "lucide-react";

interface FilterIconProps {
  type: string;
  className?: string;
}

export default function FilterIcon({ type, className = "h-4 w-4" }: FilterIconProps) {
  const lowerType = type.toLowerCase();

  if (lowerType.includes('weapon') || lowerType.includes('sword')) {
    return <Sword className={className} />;
  }

  if (lowerType.includes('armor') || lowerType.includes('shield')) {
    return <Shield className={className} />;
  }

  if (lowerType.includes('potion')) {
    return <Beaker className={className} />;
  }

  return <Sparkles className={className} />;
}
