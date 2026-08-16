import {
  FileText,
  RotateCcw,
  Clock3,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

const policies = [
  {
    icon: RotateCcw,
    title: 'Order Policy',
    description:
      'Please review your selected product carefully before completing your order.',
  },
  {
    icon: Clock3,
    title: 'Delivery',
    description:
      'Orders are processed as quickly as possible. Delivery time may vary depending on the product.',
  },
  {
    icon: MessageCircle,
    title: 'Need Help?',
    description:
      'Our support team is available to help with questions, orders, and product issues.',
  },
];

export function PolicySection() {
  return (
    <section className="relative py-14 sm:py-16 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-9">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 mb-3">
            <FileText className="w-3.5 h-3.5 text-blue-500" />

            <span className="text-xs font-semibold text-blue-600">
              Important information
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              Policies
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            A few simple guidelines to help make every order smooth
            and hassle-free.
          </p>
        </div>

        {/* POLICY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {policies.map((policy) => {
            const Icon = policy.icon;

            return (
              <div
                key={policy.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {policy.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {policy.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* QUICK POLICY NOTICE */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Shop responsibly
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Always confirm that the product, quantity, and
                account details are correct before making payment.
                If you have any concerns, contact our support team
                before completing your order.
              </p>
            </div>
          </div>
        </div>

        {/* CHECKLIST */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {[
            'Review your order',
            'Confirm payment details',
            'Keep your receipt',
            'Contact support when needed',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />

              <span className="text-xs font-medium text-slate-600">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
