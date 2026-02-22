import { LANDING_SECTION_IDS } from "./sectionIds";
import { Newsletter } from "./shared";

export function Footer() {
  return (
    <footer id={LANDING_SECTION_IDS.footer} className="border-t border-border-medium bg-background-elevated">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-section-sm sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Stay informed</h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Get release updates and deployment tips from the Nova team.
          </p>
          <div className="mt-5 max-w-md">
            <Newsletter />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm text-text-secondary">
          <div>
            <h3 className="font-semibold text-text-primary">Navigate</h3>
            <ul className="mt-3 space-y-2">
              <li><a href={`#${LANDING_SECTION_IDS.hero}`} data-scroll-link="true" className="hover:text-primary">Top</a></li>
              <li><a href={`#${LANDING_SECTION_IDS.features}`} data-scroll-link="true" className="hover:text-primary">Features</a></li>
              <li><a href={`#${LANDING_SECTION_IDS.faq}`} data-scroll-link="true" className="hover:text-primary">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Product</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="/deploy" className="hover:text-primary">Deploy app</a></li>
              <li><a href="/not-found" className="hover:text-primary">Status</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
