import {
  ShieldCheck,
  LockKeyhole,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: 'Secure & Verified',
    description:
      'Your orders and account information are handled with security in mind.',
  },
  {
    icon: LockKeyhole,
    title: 'Protected Account',
    description:
      'Your login and personal information are kept protected.',
  },
  {
    icon: CreditCard,
    title: 'Safe Payments',
    description:
      'Make payments through our secure wallet and supported payment methods.',
  },
  {
    icon: UserCheck,
    title: 'Trusted Service',
    description:
      'We focus on providing a smooth and reliable experience for every customer.',
  },
];

export function SecuritySection() {
  return (
    <section className="relative py-14 sm:py-18 bg-slate-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-9">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />

            <span className="text-xs font-semibold text-blue-600">
              Your security matters
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Shop With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              Confidence
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            DeeDee's Marketplace is designed to make your shopping
            experience simple, secure and reliable.
          </p>
        </div>

        {/* SECURITY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
                  {feature.title}
                </h3>

                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* TRUST STRIP */}
        <div className="mt-7 rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">
                Secure checkout
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">
                Protected account
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">
                Customer support
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">
                Reliable service
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
