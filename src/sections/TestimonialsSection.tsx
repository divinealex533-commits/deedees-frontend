import React, { useEffect, useMemo, useState } from "react";

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

const AVATARS = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=6",
  "https://i.pravatar.cc/150?img=7",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=10",
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=13",
  "https://i.pravatar.cc/150?img=14",
  "https://i.pravatar.cc/150?img=15",
  "https://i.pravatar.cc/150?img=16",
  "https://i.pravatar.cc/150?img=17",
  "https://i.pravatar.cc/150?img=18",
  "https://i.pravatar.cc/150?img=19",
  "https://i.pravatar.cc/150?img=20",
];

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
}

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

const StarRating = () => {
  return (
    <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="text-[22px] leading-none text-amber-500"
        >
          ★
        </span>
      ))}
    </div>
  );
};

const CustomerCard = ({ customer }: { customer: Customer }) => {
  return (
    <article
      className="
        w-[300px]
        sm:w-[340px]
        lg:w-[380px]
        shrink-0
        rounded-[24px]
        border
        border-emerald-100
        bg-white
        p-6
        shadow-[0_10px_35px_rgba(15,23,42,0.08)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]
      "
    >
      <div className="flex items-center gap-4">
        <img
          src={customer.avatar}
          alt={`${customer.name} avatar`}
          className="
            h-14
            w-14
            rounded-full
            object-cover
            border-4
            border-emerald-50
            shadow-sm
          "
          loading="lazy"
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold text-slate-900">
              {customer.name}
            </h3>

            <span
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-emerald-500
                text-[11px]
                font-bold
                text-white
              "
              title="Verified Customer"
            >
              ✓
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-slate-400">
            Verified Customer
          </p>
        </div>
      </div>

      <div className="mt-5">
        <StarRating />
      </div>

      <div className="mt-5 flex gap-3">
        <span className="text-4xl font-bold leading-none text-emerald-300">
          “
        </span>

        <p className="pt-1 text-[16px] leading-7 font-medium text-slate-600">
          {customer.review}
        </p>
      </div>
    </article>
  );
};

export function TestimonialsSection() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  /*
   * Create a completely new set of customers whenever
   * the page/component loads.
   */
  useEffect(() => {
    setCustomers(createCustomers());
  }, []);

  /*
   * Duplicate the cards so the rolling animation can
   * continue seamlessly without showing an empty space.
   */
  const rollingCustomers = useMemo(() => {
    if (customers.length === 0) return [];

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
      {/* Soft background glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-64
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-emerald-50
          opacity-70
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* SECTION HEADER */}
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
              px-5
              py-2
              text-sm
              font-bold
              text-emerald-600
            "
          >
            <span className="text-lg">★</span>
            Customer Feedback
          </div>

          <h2
            className="
              mt-6
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
              text-base
              leading-7
              text-slate-500
              sm:text-lg
            "
          >
            Real experiences from customers who have used our
            marketplace.
          </p>

          {/* RATING */}
          <div
            className="
              mx-auto
              mt-7
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-emerald-100
              bg-white
              px-5
              py-3
              shadow-sm
            "
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="text-2xl text-amber-500"
                >
                  ★
                </span>
              ))}
            </div>

            <strong className="text-lg font-extrabold text-slate-900">
              5.0
            </strong>

            <span className="text-sm font-semibold text-slate-500 sm:text-base">
              Customer Rating
            </span>
          </div>
        </div>

        {/* ROLLING REVIEWS */}
        <div
          className="
            group
            relative
            mt-12
            w-full
            overflow-hidden
          "
        >
          {/* Left fade */}
          <div
            className="
              pointer-events-none
              absolute
              left-0
              top-0
              z-10
              h-full
              w-16
              bg-gradient-to-r
              from-white
              to-transparent
              sm:w-28
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
              w-16
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
              gap-5
              animate-testimonials
              group-hover:[animation-play-state:paused]
            "
          >
            {rollingCustomers.map((customer, index) => (
              <CustomerCard
                key={`${customer.name}-${index}`}
                customer={customer}
              />
            ))}
          </div>
        </div>

        {/* Small trust message */}
        <div className="mt-10 text-center">
          <p className="text-sm font-medium text-slate-400">
            ✓ Trusted customers • ✓ Verified feedback • ★ 5-star service
          </p>
        </div>
      </div>

      {/* ANIMATION */}
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
