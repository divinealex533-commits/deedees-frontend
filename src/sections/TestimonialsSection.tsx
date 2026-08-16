import { useMemo } from 'react';

type Review = {
  text: string;
  rating: number;
};

const reviews: Review[] = [
  {
    text: 'I liked how quickly I could find what I needed. Support was also very helpful.',
    rating: 5,
  },
  {
    text: 'The service was smooth and the support responded quickly whenever I needed help.',
    rating: 5,
  },
  {
    text: 'Very easy to use and the checkout process was straightforward. I would definitely use it again.',
    rating: 5,
  },
  {
    text: 'Everything was clear and simple. My order was completed without any issues.',
    rating: 5,
  },
  {
    text: 'Great marketplace experience. The service was fast and exactly what I needed.',
    rating: 5,
  },
  {
    text: 'I was impressed with the support and how quickly my request was handled.',
    rating: 5,
  },
  {
    text: 'The website is easy to navigate and finding what I wanted was very simple.',
    rating: 5,
  },
  {
    text: 'Excellent experience from start to finish. I will definitely come back again.',
    rating: 5,
  },
];

const customerNames = [
  'David Okafor',
  'Chiamaka Eze',
  'Daniel Adeyemi',
  'Blessing Johnson',
  'Emmanuel Obi',
  'Esther Williams',
  'Michael Okechukwu',
  'Precious Nwosu',
  'Samuel Ibrahim',
  'Favour Adebayo',
  'Joshua Okoro',
  'Mercy Eze',
  'Victor Chukwu',
  'Grace Adeyemi',
  'Henry Umeh',
  'Joyce Okafor',
  'Caleb Nnamdi',
  'Deborah Williams',
  'Anthony Obi',
  'Jennifer Eze',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    [copy[i], copy[randomIndex]] = [
      copy[randomIndex],
      copy[i],
    ];
  }

  return copy;
}

export function TestimonialsSection() {
  /*
   * This runs once when the component is created.
   * Therefore every fresh page load gets a new
   * random combination of names and reviews.
   */
  const customers = useMemo(() => {
    const shuffledNames = shuffle(customerNames);
    const shuffledReviews = shuffle(reviews);

    return shuffledReviews.slice(0, 6).map(
      (review, index) => ({
        ...review,
        name: shuffledNames[index],
      })
    );
  }, []);

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-600">
            <span className="text-lg">★</span>
            Customer Feedback
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            What Our{' '}
            <span className="text-emerald-600">
              Customers Say
            </span>
          </h2>

          <p className="mt-4 text-base font-medium text-slate-500 sm:text-lg">
            Real experiences from customers who have used our marketplace.
          </p>

          {/* Rating */}
          <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-white px-5 py-3 shadow-sm">
            <div className="flex gap-1 text-xl text-amber-500">
              ★★★★★
            </div>

            <span className="font-extrabold text-slate-900">
              5.0
            </span>

            <span className="text-slate-500">
              Customer Rating
            </span>
          </div>
        </div>

        {/* Moving reviews */}
        <div className="relative mt-12">

          <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">

            {customers.map((customer, index) => (
              <article
                key={`${customer.name}-${index}`}
                className="min-w-[290px] max-w-[340px] flex-1 snap-center rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(15,23,42,0.12)] sm:min-w-[330px]"
              >

                {/* Customer */}
                <div className="flex items-center gap-4">

                  {/* Random-looking avatar */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-lg font-extrabold text-white shadow-md">
                    {getInitials(customer.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">

                      <h3 className="truncate text-lg font-extrabold text-slate-900">
                        {customer.name}
                      </h3>

                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs text-emerald-600">
                        ✓
                      </span>

                    </div>

                    <p className="mt-1 text-sm font-medium text-slate-400">
                      Verified Customer
                    </p>
                  </div>

                </div>

                {/* Stars */}
                <div className="mt-5 flex gap-1 text-xl text-amber-500">
                  {'★'.repeat(customer.rating)}
                </div>

                {/* Review */}
                <div className="mt-4 flex gap-3">

                  <span className="text-3xl leading-none text-emerald-400">
                    “
                  </span>

                  <p className="pt-1 text-base font-medium leading-7 text-slate-600">
                    {customer.text}
                  </p>

                </div>

              </article>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
}
