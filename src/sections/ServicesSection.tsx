import {
  Shield,
  Building2,
  Globe,
  Settings,
  Zap,
  Instagram,
  Facebook,
  Twitter,
  Music2,
  MessageCircle,
  Disc3,
  Youtube,
  Send,
  ShoppingBag,
} from 'lucide-react';

import type { Category } from '@/types';

interface ServicesSectionProps {
  categories: Category[];
}

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Building2,
  Globe,
  Settings,
};

const platformIconMap: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  'x (twitter)': Twitter,
  twitter: Twitter,
  tiktok: Music2,
  whatsapp: MessageCircle,
  spotify: Disc3,
  discord: MessageCircle,
  youtube: Youtube,
  telegram: Send,
  pinterest: ShoppingBag,
};

function getPlatformIcon(name: string) {
  const key = name.trim().toLowerCase();

  return (
    platformIconMap[key] ||
    iconMap[key] ||
    Shield
  );
}

export function ServicesSection({
  categories,
}: ServicesSectionProps) {
  const scrollToCatalog = () => {
    const element =
      document.getElementById('catalog');

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  /*
   * Duplicate the list so the CSS marquee can
   * continuously roll without an empty gap.
   */
  const rollingCategories = [
    ...categories,
    ...categories,
  ];

  return (
    <section
      id="services"
      className="marketplace-services"
    >
      <div className="marketplace-services-inner">

        {/* SECTION TITLE */}

        <div className="marketplace-services-heading">

          <div className="marketplace-services-badge">
            <Zap size={15} />
            <span>What We Offer</span>
          </div>

          <h2>
            Our{' '}
            <span>
              Services
            </span>
          </h2>

          <p>
            Premium accounts for all your
            social media needs
          </p>

        </div>


        {/* ROLLING SERVICES */}

        <div
          className="services-marquee"
          aria-label="Available services"
        >

          <div className="services-marquee-track">

            {rollingCategories.map(
              (category, index) => {

                const IconComponent =
                  getPlatformIcon(
                    category.name
                  );

                return (
                  <button
                    key={`${category.id}-${index}`}
                    type="button"
                    className="service-pill"
                    onClick={
                      scrollToCatalog
                    }
                    title={
                      category.description ||
                      category.name
                    }
                  >

                    <span className="service-pill-icon">
                      <IconComponent
                        size={19}
                        strokeWidth={2}
                      />
                    </span>

                    <span className="service-pill-name">
                      {category.name}
                    </span>

                  </button>
                );
              }
            )}

          </div>

        </div>


        {/* SMALL SECOND ROLLING ROW */}

        <div
          className="services-marquee services-marquee-reverse"
          aria-hidden="true"
        >

          <div className="services-marquee-track">

            {[
              ...rollingCategories,
            ]
              .reverse()
              .map(
                (category, index) => {

                  const IconComponent =
                    getPlatformIcon(
                      category.name
                    );

                  return (
                    <button
                      key={`reverse-${category.id}-${index}`}
                      type="button"
                      className="service-pill"
                      onClick={
                        scrollToCatalog
                      }
                    >

                      <span className="service-pill-icon">
                        <IconComponent
                          size={19}
                          strokeWidth={2}
                        />
                      </span>

                      <span className="service-pill-name">
                        {category.name}
                      </span>

                    </button>
                  );
                }
              )}

          </div>

        </div>

      </div>
    </section>
  );
}
