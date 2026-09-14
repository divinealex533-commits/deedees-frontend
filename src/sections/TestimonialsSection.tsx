import { useEffect, useMemo, useState } from "react";

type Customer = {
  name: string;
  avatar: string;
  review: string;
};

const CUSTOMER_NAMES = [
  "Daniel",
  "Michael",
  "David",
  "Samuel",
  "Joshua",
  "Benjamin",
  "Emmanuel",
  "Victor",
  "Christopher",
  "Anthony",
  "Ibrahim",
  "Musa",
  "Chinedu",
  "Obinna",
  "Tunde",
  "Femi",
  "Adebayo",
  "Yusuf",
  "Kelvin",
  "Bright",
  "Precious",
  "Esther",
  "Blessing",
  "Mercy",
  "Faith",
  "Grace",
  "Jennifer",
  "Mary",
  "Sarah",
  "Joy",
];

const REVIEWS = [
  "I liked how quickly I could find what I needed. Support was also very helpful.",
  "The service was smooth and everything was easy to understand. I will definitely use it again.",
  "Very easy to use and the checkout process was straightforward. I had no issues at all.",
  "I received my order quickly and the support team was responsive whenever I needed help.",
  "The marketplace is clean, simple and easy to navigate. Everything was exactly as expected.",
  "I really liked the fast delivery. The whole process was simple from start to finish.",
  "Great experience. The payment process was easy and customer support was very helpful.",
  "The website is easy to navigate and I found exactly what I was looking for.",
  "Fast service and good communication. I would definitely recommend the marketplace.",
  "Everything went smoothly. I had a very good experience using DeeDee's Marketplace.",
  "The support was excellent and my order was handled quickly. Very impressed.",
  "Simple checkout, fast response and good service. I will definitely come back.",
];

const AVATARS = Array.from(
  { length: 20 },
  (_, index) => `https://i.pravatar.cc/150?img=${index + 1}`
);

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[randomIndex]] = [
      copy[randomIndex],
      copy[i],
    ];
  }

  return copy;
}

/*
 * Creates a completely new combination of:
 * - customer name
 * - avatar
 * - review
 *
 * Every time the page loads, the order is randomized.
 * Names and avatars are shuffled separately so each card
 * receives a different avatar.
 */
function createCustomers(): Customer[] {
  const names = shuffle(CUSTOMER_NAMES);
  const avatars = shuffle(AVATARS);
  const reviews = shuffle(REVIEWS);

  return names.slice(0, 10).map((name, index) => ({
    name,
    avatar: avatars[index],
    review: reviews[index % reviews.length],
  }));
}

function StarRating() {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label="5 star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="text-lg leading-none text-amber-400"
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CustomerCard({
  customer,
}: {
  customer: Customer;
}) {
  return (
    <article
      className="
        w-[300px]
        shrink-0
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-emerald-300
        hover:shadow-lg
        sm:w-[340px]
        lg:w-[380px]
      "
    >
      {/* CUSTOMER */}
      <div className="flex items-center gap-3">
        <img
          src={customer.avatar}
          alt={`${customer.name}'s profile`}
          className="
            h-12
            w-12
            shrink-0
            rounded-full
            border-2
            border-emerald-100
            object-cover
            shadow-sm
          "
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src =
              "https://i.pravatar.cc/150?img=12";
          }}
        />

        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">
            {customer.name}
          </h3>

          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Marketplace Customer
          </p>
        </div>

        <div
          className="
            ml-auto
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-emerald-50
            text-xs
            font-bold
            text-emerald-600
          "
          title="Customer"
        >
          ✓
        </div>
      </div>

      {/* RATING */}
      <div className="mt-4">
        <StarRating />
      </div>

      {/* REVIEW */}
      <div className="mt-4 flex gap-2">
        <span
          className="
            text-3xl
            font-bold
            leading-none
            text-emerald-200
          "
          aria-hidden="true"
        >
          “
        </span>

        <p className="pt-0.5 text-sm leading-6 text-slate-600">
          {customer.review}
        </p>
      </div>
    </article>
  );
}

export function TestimonialsSection() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  /*
   * Generate a fresh random set every time the component loads.
   */
  useEffect(() => {
    setCustomers(createCustomers());
  }, []);

  /*
   * Duplicate the list so the horizontal animation can
   * loop continuously without an empty space.
   */
  const rollingCustomers = useMemo(() => {
    if (customers.length === 0) {
      return [];
    }

    return [...customers, ...customers];
  }, [customers]);

  return (
    <section
      id="testimonials"
      className="
        relative
        w-full
        overflow-hidden
        bg-white
        py-16
        sm:py-20
      "
    >
      {/* BACKGROUND GLOW */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-72
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-emerald-50
          opacity-70
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="px-5 text-center">
          <div
            className="
              mx-auto
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-emerald-200
              bg-emerald-50
              px-4
              py-2
              text-xs
              font-bold
              text-emerald-600
              sm:text-sm
            "
          >
            <span
              className="text-base text-amber-400"
              aria-hidden="true"
            >
              ★
            </span>

            Customer Feedback
          </div>

          <h2
            className="
              mt-5
              text-3xl
              font-extrabold
              tracking-tight
              text-slate-950
              sm:text-4xl
              lg:text-5xl
            "
          >
            What Our{" "}
            <span className="text-emerald-600">
              Customers Say
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
              sm:text-base
              sm:leading-7
            "
          >
            See what customers have to say about their
            experience with DeeDee's Marketplace.
          </p>

          {/* RATING SUMMARY */}
          <div
            className="
              mx-auto
              mt-6
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              shadow-sm
            "
          >
            <StarRating />

            <span className="font-extrabold text-slate-900">
              5.0
            </span>

            <span className="text-xs font-medium text-slate-500 sm:text-sm">
              Customer Experience
            </span>
          </div>
        </div>

        {/* ROLLING REVIEWS */}
        <div
          className="
            group
            relative
            mt-10
            w-full
            overflow-hidden
            sm:mt-12
          "
        >
          {/* LEFT FADE */}
          <div
            className="
              pointer-events-none
              absolute
              left-0
              top-0
              z-10
              h-full
              w-12
              bg-gradient-to-r
              from-white
              to-transparent
              sm:w-28
            "
          />

          {/* RIGHT FADE */}
          <div
            className="
              pointer-events-none
              absolute
              right-0
              top-0
              z-10
              h-full
              w-12
              bg-gradient-to-l
              from-white
              to-transparent
              sm:w-28
            "
          />

          <div
            className="
              flex
              w-max
              gap-4
              animate-testimonials
              group-hover:[animation-play-state:paused]
              sm:gap-5
            "
          >
            {rollingCustomers.map(
              (customer, index) => (
                <CustomerCard
                  key={`${customer.name}-${index}`}
                  customer={customer}
                />
              )
            )}
          </div>
        </div>

        {/* TRUST MESSAGE */}
        <div className="mt-9 px-5 text-center">
          <p className="text-xs font-medium text-slate-400 sm:text-sm">
            ★ Quality service • ✓ Customer-focused support • ⚡ Fast delivery
          </p>
        </div>
      </div>

      {/* ROLLING ANIMATION */}
      <style>{`
        @keyframes testimonialsRoll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(
              calc(-50% - 10px)
            );
          }
        }

        .animate-testimonials {
          animation: testimonialsRoll 45s linear infinite;
          will-change: transform;
        }

        @media (max-width: 640px) {
          .animate-testimonials {
            animation-duration: 38s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-testimonials {
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
}

export default TestimonialsSection;
