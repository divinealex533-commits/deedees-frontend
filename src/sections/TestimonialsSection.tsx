import {
  Star,
  Quote,
  CheckCircle2,
} from 'lucide-react';

type Review = {
  name: string;
  role: string;
  review: string;
  rating: number;
  initials: string;
};

const reviews: Review[] = [
  {
    name: 'Customer 01',
    role: 'Verified Customer',
    review:
      'Great experience from start to finish. The ordering process was simple and delivery was fast.',
    rating: 5,
    initials: 'C1',
  },
  {
    name: 'Customer 02',
    role: 'Verified Customer',
    review:
      'The service was smooth and support responded quickly whenever I needed help.',
    rating: 5,
    initials: 'C2',
  },
  {
    name: 'Customer 03',
    role: 'Verified Customer',
    review:
      'Very easy to use and the checkout process was straightforward. I would definitely use it again.',
    rating: 5,
    initials: 'C3',
  },
  {
    name: 'Customer 04',
    role: 'Verified Customer',
    review:
      'Fast delivery and a clean experience. Everything was clearly explained before payment.',
    rating: 5,
    initials: 'C4',
  },
  {
    name: 'Customer 05',
    role: 'Verified Customer',
    review:
      'I liked how quickly I could find what I needed. Support was also very helpful.',
    rating: 5,
    initials: 'C5',
  },
  {
    name: 'Customer 06',
    role: 'Verified Customer',
    review:
      'Simple, professional and easy to navigate. The whole process was much easier than expected.',
    rating: 5,
    initials: 'C6',
  },
];

function ReviewCard({
  review,
}: {
  review: Review;
}) {
  return (
    <article className="customer-review-card">

      <div className="customer-review-top">

        <div className="customer-avatar">
          {review.initials}
        </div>

        <div className="customer-review-info">

          <div className="customer-name-row">

            <strong>
              {review.name}
            </strong>

            <CheckCircle2
              size={15}
              className="customer-verified"
            />

          </div>

          <span>
            {review.role}
          </span>

        </div>

      </div>


      <div className="customer-stars">

        {Array.from({
          length: review.rating,
        }).map((_, index) => (
          <Star
            key={index}
            size={17}
            fill="currentColor"
          />
        ))}

      </div>


      <div className="customer-review-text">

        <Quote
          size={22}
          className="customer-quote"
        />

        <p>
          {review.review}
        </p>

      </div>

    </article>
  );
}


export function TestimonialsSection() {
  /*
   * Duplicate the reviews to create a
   * seamless infinite marquee.
   */
  const rollingReviews = [
    ...reviews,
    ...reviews,
  ];

  return (
    <section
      id="testimonials"
      className="customer-testimonials"
    >

      <div className="customer-testimonials-inner">

        {/* HEADER */}

        <div className="customer-testimonials-heading">

          <div className="customer-testimonials-badge">
            <Star
              size={15}
              fill="currentColor"
            />

            <span>
              Customer Feedback
            </span>
          </div>


          <h2>
            What Our{' '}
            <span>
              Customers Say
            </span>
          </h2>


          <p>
            Real experiences from customers
            who have used our marketplace.
          </p>


          <div className="overall-rating">

            <div className="overall-stars">

              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <Star
                    key={star}
                    size={18}
                    fill="currentColor"
                  />
                )
              )}

            </div>

            <strong>
              5.0
            </strong>

            <span>
              Customer Rating
            </span>

          </div>

        </div>


        {/* MOVING REVIEWS */}

        <div
          className="reviews-marquee"
          aria-label="Customer reviews"
        >

          <div className="reviews-marquee-track">

            {rollingReviews.map(
              (review, index) => (

                <ReviewCard
                  key={`${review.name}-${index}`}
                  review={review}
                />

              )
            )}

          </div>

        </div>


        {/* SECOND ROW — OPPOSITE DIRECTION */}

        <div
          className="reviews-marquee reviews-marquee-reverse"
          aria-hidden="true"
        >

          <div className="reviews-marquee-track">

            {[...rollingReviews]
              .reverse()
              .map((review, index) => (

                <ReviewCard
                  key={`reverse-${review.name}-${index}`}
                  review={review}
                />

              ))}

          </div>

        </div>

      </div>

    </section>
  );
}
