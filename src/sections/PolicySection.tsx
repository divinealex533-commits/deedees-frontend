import {
  ShieldCheck,
  LockKeyhole,
  WalletCards,
  RefreshCcw,
  FileCheck2,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

const policies = [
  {
    icon: ShieldCheck,
    title: 'Secure & Verified',
    description:
      'Your account information and transactions are protected with secure systems.',
  },
  {
    icon: LockKeyhole,
    title: 'Privacy Protected',
    description:
      'We keep your personal information private and only use it when necessary to provide our services.',
  },
  {
    icon: WalletCards,
    title: 'Secure Payments',
    description:
      'Pay through our secure checkout and wallet system for a smooth purchasing experience.',
  },
  {
    icon: RefreshCcw,
    title: 'Order Protection',
    description:
      'If you experience an issue with your order, contact support and we will review it.',
  },
  {
    icon: FileCheck2,
    title: 'Clear Information',
    description:
      'Product details, prices and availability are displayed before you complete your purchase.',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    description:
      'Our support team is available to help with orders, payments and account-related questions.',
  },
];

export function PolicySection() {
  return (
    <section
      id="policy"
      className="relative py-14 sm:py-16 bg-white overflow-hidden"
    >
      {/* Soft background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />

            <span className="text-xs font-semibold text-blue-600">
              Shop With Confidence
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              Policies
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500">
            Simple, transparent and customer-focused policies designed
            to give you a safe shopping experience.
          </p>
        </div>

        {/* POLICY GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {policies.map((policy) => {
            const Icon = policy.icon;

            return (
              <div
                key={policy.title}
                className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                      {policy.title}
                    </h3>

                    <p className="text-[11px] sm:text-xs leading-relaxed text-slate-500">
                      {policy.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TRUST BAR */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Secure Checkout
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Fast Delivery
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Customer Support
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Trusted Marketplace
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
