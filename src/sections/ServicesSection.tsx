import { Card, CardContent } from '@/components/ui/card';
import { Shield, Building2, Globe, Settings, Zap } from 'lucide-react';
import type { Category } from '@/types';

interface ServicesSectionProps {
  categories: Category[];
}

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Building2,
  Globe,
  Settings,
};

export function ServicesSection({ categories }: ServicesSectionProps) {
  const scrollToCatalog = () => {
    const element = document.getElementById('catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stats = [
    { value: '500+', label: 'Accounts Sold', color: 'from-blue-400 to-cyan-400' },
    { value: '99%', label: 'Success Rate', color: 'from-cyan-400 to-teal-400' },
    { value: '24/7', label: 'Support Available', color: 'from-teal-400 to-green-400' },
  ];

  return (
    <section id="services" className="py-16 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs text-blue-300">What We Offer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Services</span>
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Premium accounts for all your social media needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || ''] || Shield;
            return (
              <Card 
                key={category.id}
                className="group bg-slate-950 border-blue-500/20 hover:border-cyan-500/50 transition-all duration-500 cursor-pointer overflow-hidden relative"
                onClick={scrollToCatalog}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-500"></div>
                
                <CardContent className="p-4 relative">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-4.5 w-4.5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-slate-400 text-xs">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-2xl bg-slate-950 border border-blue-500/20">
              <div className={`text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
