import {
  Search,
  ShoppingCart,
  WalletCards,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Choose a Product',
    description:
      'Browse the marketplace or search for exactly what you need.',
  },
  {
    number: '02',
    icon: ShoppingCart,
    title: 'Place Your Order',
    description:
      'Select your quantity and continue through the simple checkout.',
  },
  {
    number: '03',
    icon: WalletCards,
    title: 'Pay Securely',
    description:
      'Use your wallet balance or add funds securely when needed.',
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Receive Your Order',
    description:
      'Once your payment is confirmed, your order is processed quickly.',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-white py-16 sm:py-20"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[700px] -translate-x-1/2 rounded-full bg-blue-50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 sm:text-sm">
            <WalletCards className="h-4 w-4" />
            Simple &amp; Secure
          </div>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            How It{' '}
            <span className="text-emerald-500">
              Works
            </span>
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
            Getting what you need from DeeDee's Marketplace takes just a
            few simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative">
                {/* Connecting line */}
                {index < STEPS.length - 1 && (
                  <div className="pointer-events-none absolute left-[calc(100%+4px)] top-10 hidden w-5 lg:block">
                    <ArrowRight className="h-5 w-5 text-blue-200" />
                  </div>
                )}

                <div
                  className="
                    group
                    h-full
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-blue-300
                    hover:shadow-xl
                    hover:shadow-blue-500/5
                  "
                >
                  {/* Number + Icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-6 w-6" />
                    </div>

                    <span className="text-4xl font-black text-slate-100">
                      {step.number}
                    </span>
                  </div>

                  {/* Text */}
                  <h3 className="mt-6 text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>

                  {/* Small indicator */}
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Easy &amp; reliable
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom message */}
        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-center">
          <p className="text-sm font-medium leading-6 text-slate-600">
            From browsing to checkout, we keep the process{' '}
            <span className="font-bold text-blue-600">
              simple, fast and secure.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
