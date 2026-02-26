import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  index?: number;
}

export function FeatureCard({ title, description, icon, index = 0 }: FeatureCardProps) {
  return (
    <article 
      className="group rounded-card border border-border-medium bg-background-card p-6 shadow-card-hover transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-glow-red"
      style={{ 
        animationDelay: `${index * 100}ms`,
        willChange: 'transform, box-shadow'
      }}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </article>
  );
}
