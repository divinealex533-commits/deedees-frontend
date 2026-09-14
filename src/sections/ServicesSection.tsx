import {
  ShieldCheck,
  Zap,
  Headphones,
  Wallet,
  BadgeCheck,
  Truck,
} from 'lucide-react';
import type { Category } from '@/types';

interface ServicesSectionProps {
  categories: Category[];
}

const services = [
  {
    icon: ShieldCheck,
    title: 'Verified & Secure',
    description: 'Safe and reliable products',
  },
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Quick order processing',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We are always available',
  },
  {
    icon: Wallet,
    title: 'Secure Wallet',
    description: 'Easy and protected payments',
  },
  {
    icon: BadgeCheck,
    title: 'Quality Products',
    description: 'Carefully selected products',
  },
  {
    icon: Truck,
    title: 'Reliable Service',
    description: 'Orders handled with care',
  },
];

export function ServicesSection({
  categories,
}: ServicesSectionProps) {
  return (
    <section className="relative py-10 sm:py-14 bg-white overflow-hidden">
      {/* Soft background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION TITLE */}
        <div className="text-center mb-7">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-2">
            Why choose DeeDee's?
          </span>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
            Simple. Fast.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              Reliable.
            </span>
          </h2>

          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
            Everything you need for a smooth and secure shopping
            experience.
          </p>
        </div>

        {/* SERVICES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group relative rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all duration-300"
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                {/* Icon */}
                <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                  {service.title}
                </h3>

                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CATEGORY MINI STRIP */}
        {categories.length > 0 && (
          <div className="mt-7 overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="shrink-0 text-xs font-semibold text-slate-500 mr-1">
                Popular:
              </span>

              {categories.slice(0, 8).map((category) => (
                <div
                  key={category.id}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-colors"
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
