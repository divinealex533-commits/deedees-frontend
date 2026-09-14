import {
  ShieldCheck,
  LockKeyhole,
  Zap,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Secure & Verified',
    description: 'Your orders and payments are handled securely.',
  },
  {
    icon: LockKeyhole,
    title: 'Safe Payments',
    description: 'Protected wallet checkout for every purchase.',
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Quick processing so you can get started sooner.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our support team is available whenever you need help.',
  },
];

export function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-14 sm:py-20">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 sm:text-sm">
            <ShieldCheck className="h-4 w-4" />
            Why Choose DeeDee's
          </div>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Shop With{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Confidence
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
            Everything is designed to make your experience simple,
            secure and reliable.
          </p>
        </div>

        {/* Trust cards */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-blue-300
                  hover:shadow-lg
                  sm:rounded-3xl
                  sm:p-6
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-500
                    transition-transform
                    duration-300
                    group-hover:scale-110
                    sm:h-14
                    sm:w-14
                    sm:rounded-2xl
                  "
                >
                  <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900 sm:text-lg">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 sm:text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Trusted service
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom trust strip */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center text-xs font-medium text-slate-400 sm:mt-10 sm:text-sm">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Secure checkout
          </span>

          <span className="hidden text-slate-300 sm:inline">•</span>

          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Fast processing
          </span>

          <span className="hidden text-slate-300 sm:inline">•</span>

          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Customer support
          </span>
        </div>
      </div>
    </section>
  );
}

export default TrustSection;
