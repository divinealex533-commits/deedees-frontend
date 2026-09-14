import {
  ShieldCheck,
  LockKeyhole,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Headphones,
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
      'Use our secure wallet and supported payment methods with confidence.',
  },
  {
    icon: UserCheck,
    title: 'Trusted Service',
    description:
      'We focus on giving every customer a smooth and reliable experience.',
  },
];

export function SecuritySection() {
  return (
    <section className="relative py-12 sm:py-16 bg-white overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-8">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />

            <span className="text-xs font-semibold text-blue-600">
              Your security matters
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            Shop With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              Confidence
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            DeeDee's Marketplace is built to make your shopping
            experience simple, secure and reliable.
          </p>
        </div>

        {/* SECURITY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {securityFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >

                {/* Icon */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
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
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-cyan-50 border border-blue-100 shadow-sm px-4 py-4 sm:px-6">

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">

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
              <Zap className="w-4 h-4 text-blue-500" />

              <span className="text-xs font-medium text-slate-600">
                Fast delivery
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-cyan-500" />

              <span className="text-xs font-medium text-slate-600">
                24/7 support
              </span>
            </div>

          </div>
        </div>

        {/* MINI TRUST MESSAGE */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />

            <span>
              Your trust is important to us at DeeDee's Marketplace.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
