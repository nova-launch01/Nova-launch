import { LANDING_SECTION_IDS } from "./sectionIds";
import { BentoCard } from "./shared/BentoCard";

export function HowItWorks() {
  return (
    <section
      id={LANDING_SECTION_IDS.howItWorks}
      className="relative overflow-hidden bg-hero-gradient px-6 py-24 sm:px-8 lg:px-12"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Deploy your token in four simple steps. No coding required.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-3">
          {/* Step 1 - Large (spans 2 rows) */}
          <BentoCard
            size="large"
            step={1}
            title="Connect Wallet"
            description="Link your Freighter or Albedo wallet to get started. Your wallet stays secure and under your control."
            icon={
              <svg
                className="h-48 w-48"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            }
          />

          {/* Step 2 - Medium */}
          <BentoCard
            size="medium"
            step={2}
            title="Configure Token"
            description="Set your token name, symbol, total supply, and decimal places."
            icon={
              <svg
                className="h-32 w-32"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            }
          />

          {/* Step 3 - Medium */}
          <BentoCard
            size="medium"
            step={3}
            title="Upload Metadata"
            description="Add your token logo and description. We'll store it securely on IPFS."
            icon={
              <svg
                className="h-32 w-32"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            }
          />

          {/* Step 4 - Wide (spans 2 columns) */}
          <BentoCard
            size="wide"
            step={4}
            title="Deploy & Launch"
            description="Review your configuration and deploy with one click. Your token will be live on the Stellar network in seconds."
            icon={
              <svg
                className="h-40 w-40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2.81 2.81L1.39 4.22l2.27 2.27C2.61 8.07 2 9.96 2 12c0 5.52 4.48 10 10 10 2.04 0 3.93-.61 5.51-1.66l2.27 2.27 1.41-1.41L2.81 2.81zM12 20c-4.41 0-8-3.59-8-8 0-1.48.41-2.86 1.12-4.06l10.94 10.94C14.86 19.59 13.48 20 12 20zM7.94 5.12L6.49 3.66C8.07 2.61 9.96 2 12 2c5.52 0 10 4.48 10 10 0 2.04-.61 3.93-1.66 5.51l-1.45-1.45C19.59 14.86 20 13.48 20 12c0-4.41-3.59-8-8-8-1.48 0-2.86.41-4.06 1.12z" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}
