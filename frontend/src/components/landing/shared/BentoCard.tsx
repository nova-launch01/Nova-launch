import { ReactNode } from "react";

type BentoCardSize = "large" | "medium" | "wide";

interface BentoCardProps {
  size: BentoCardSize;
  step: number;
  title: string;
  description: string;
  icon: ReactNode;
}

const sizeClasses: Record<BentoCardSize, string> = {
  large: "md:col-span-1 md:row-span-2",
  medium: "md:col-span-1 md:row-span-1",
  wide: "md:col-span-2 md:row-span-1",
};

export function BentoCard({ size, step, title, description, icon }: BentoCardProps) {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 
        p-8 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover
        border border-white/5 hover:border-white/10
        ${sizeClasses[size]}
      `}
    >
      {/* Step Badge */}
      <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
        {step}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
        <p className="text-base leading-relaxed text-gray-400">{description}</p>
      </div>

      {/* Icon/Image */}
      <div className="absolute bottom-0 right-0 text-[#ff6b5e] opacity-40 transition-opacity duration-300 group-hover:opacity-60">
        {icon}
      </div>
    </div>
  );
}
