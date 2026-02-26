import {
  Zap,
  ShieldCheck,
  Palette,
  Search,
  Layers,
  DollarSign
} from "lucide-react";
import { LANDING_SECTION_IDS } from "./sectionIds";
import { FeatureCard, PillTag } from "./shared";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

const FEATURES_DATA = [
  {
    icon: <Zap size={24} />,
    title: "No-Code Deployment",
    description: "Deploy tokens without writing code. Our intuitive interface handles the technical complexity for you."
  },
  {
    icon: <Search size={24} />,
    title: "Instant Metadata",
    description: "IPFS-powered token metadata. Upload logos and customize your token's identity in seconds."
  },
  {
    icon: <Layers size={24} />,
    title: "Stellar Native",
    description: "Built on Stellar's fast, low-cost network, providing unparalleled efficiency and reliability."
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Secure & Audited",
    description: "Smart contracts verified and tested to ensure your assets are protected and secure."
  },
  {
    icon: <Palette size={24} />,
    title: "Custom Branding",
    description: "Complete control over your project's appearance. Upload logos and customize brand elements."
  },
  {
    icon: <DollarSign size={24} />,
    title: "Low Fees",
    description: "Transparent, minimal deployment costs. Pay only for what you use with no hidden charges."
  }
];

export function Features() {
  const [sectionRef, isVisible] = useIntersectionObserver<HTMLElement>({
    threshold: 0.1,
    freezeOnceVisible: true
  });

  return (
    <section
      id={LANDING_SECTION_IDS.features}
      ref={sectionRef}
      className={`mx-auto max-w-7xl px-4 py-section sm:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="text-center md:text-left">
        <PillTag tone="neutral">Features</PillTag>
        <h2 className="mt-3 text-heading-xl text-text-primary">
          Why Choose NovaLaunch
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          The most powerful and efficient way to launch your tokens on the Stellar network.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES_DATA.map((feature, index) => (
          <div
            key={index}
            className={`transition-all duration-700 delay-[${index * 100}ms] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            style={{
              transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
            }}
          >
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
