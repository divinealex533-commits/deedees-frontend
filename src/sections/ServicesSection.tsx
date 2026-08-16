import {
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  createdAt: string;
}

interface ServicesSectionProps {
  categories: Category[];
}

const fallbackIcons = [
  '📱',
  '🎮',
  '💻',
  '📈',
  '🎨',
  '🚀',
  '🛍️',
  '⚡',
];

export function ServicesSection({
  categories,
}: ServicesSectionProps) {
  /*
   * We use the categories already coming from your store.
   * Nothing is changed in your API/data structure.
   */
  const validCategories = categories ?? [];

  /*
   * Duplicate the categories so the horizontal animation
   * can loop continuously without leaving an empty space.
   */
  const rollingCategories = [
    ...validCategories,
    ...validCategories,
  ];

  if (validCategories.length === 0) {
    return null;
  }

  return (
    <section
      id="services"
      className="
        relative
        overflow-hidden
        bg-slate-50
        py-12
        sm:py-16
      "
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            
            <div>
              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-emerald-600
                "
              >
                <Sparkles className="h-3.5 w-3.5" />

                Explore Services
              </div>

              <h2
                className="
                  text-2xl
                  font-black
                  tracking-tight
                  text-slate-950
                  sm:text-3xl
                "
              >
                What are you{' '}
                <span className="text-emerald-600">
                  looking for?
                </span>
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Browse our popular categories and find the
                service or digital product you need.
              </p>
            </div>

            {/* Small indicator */}
            <div
              className="
                hidden
                items-center
                gap-2
                rounded-full
                border
                border-slate-200
                bg-white
                px-4
                py-2
                text-xs
                font-semibold
                text-slate-500
                shadow-sm
                sm:flex
              "
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

              Swipe to explore
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* ROLLING SERVICES */}
        <div className="relative mt-8 w-full overflow-hidden">
          
          {/* Left fade */}
          <div
            className="
              pointer-events-none
              absolute
              left-0
              top-0
              z-10
              h-full
              w-10
              bg-gradient-to-r
              from-slate-50
              to-transparent
              sm:w-20
            "
          />

          {/* Right fade */}
          <div
            className="
              pointer-events-none
              absolute
              right-0
              top-0
              z-10
              h-full
              w-10
              bg-gradient-to-l
              from-slate-50
              to-transparent
              sm:w-20
            "
          />

          <div
            className="
              group
              flex
              w-max
              gap-4
              animate-services
              hover:[animation-play-state:paused]
            "
          >
            {rollingCategories.map(
              (category, index) => {
                const icon =
                  category.icon ||
                  fallbackIcons[
                    index %
                      fallbackIcons.length
                  ];

                return (
                  <div
                    key={`${category.id}-${index}`}
                    className="
                      w-[245px]
                      shrink-0
                      sm:w-[280px]
                    "
                  >
                    <div
                      className="
                        group/card
                        relative
                        h-full
                        overflow-hidden
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-5
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-emerald-200
                        hover:shadow-lg
                      "
                    >
                      {/* Image background if available */}
                      {category.imageUrl && (
                        <div
                          className="
                            absolute
                            inset-0
                            opacity-[0.06]
                            transition-opacity
                            duration-300
                            group-hover/card:opacity-[0.10]
                          "
                          style={{
                            backgroundImage: `url(${category.imageUrl})`,
                            backgroundPosition:
                              'center',
                            backgroundSize:
                              'cover',
                          }}
                        />
                      )}

                      <div className="relative z-10">
                        {/* Icon */}
                        <div
                          className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gradient-to-br
                            from-emerald-50
                            to-teal-50
                            text-2xl
                            transition-transform
                            duration-300
                            group-hover/card:scale-110
                          "
                        >
                          {icon}
                        </div>

                        {/* Name */}
                        <h3
                          className="
                            mt-4
                            line-clamp-1
                            text-base
                            font-extrabold
                            text-slate-900
                          "
                        >
                          {category.name}
                        </h3>

                        {/* Description */}
                        <p
                          className="
                            mt-2
                            line-clamp-2
                            min-h-[40px]
                            text-xs
                            font-medium
                            leading-5
                            text-slate-500
                          "
                        >
                          {category.description ||
                            'Explore our available products and services.'}
                        </p>

                        {/* Bottom */}
                        <div
                          className="
                            mt-5
                            flex
                            items-center
                            justify-between
                            border-t
                            border-slate-100
                            pt-4
                          "
                        >
                          <span className="text-xs font-bold text-emerald-600">
                            Explore
                          </span>

                          <div
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-full
                              bg-emerald-50
                              text-emerald-600
                              transition-all
                              duration-300
                              group-hover/card:bg-emerald-500
                              group-hover/card:text-white
                            "
                          >
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="mx-auto mt-7 flex max-w-7xl items-center justify-center gap-2 px-4 text-xs font-medium text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Popular services
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes servicesRoll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(
              calc(-50% - 8px)
            );
          }
        }

        .animate-services {
          animation: servicesRoll 35s linear infinite;
          will-change: transform;
        }

        @media (max-width: 640px) {
          .animate-services {
            animation-duration: 28s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-services {
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
}
