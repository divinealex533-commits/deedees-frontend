import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, UserCheck, FileText } from 'lucide-react';

export function PolicySection() {
  const policies = [
    {
      icon: AlertTriangle,
      title: 'Final Sale Policy',
      description: 'Due to the nature of digital assets, refunds are not provided once login details are sent. Please verify your order before completing payment.',
      highlight: 'No Refunds',
      color: 'text-amber-400',
      bgColor: 'from-amber-500/20 to-orange-500/20',
    },
    {
      icon: RefreshCw,
      title: 'Replacement Policy',
      description: 'We offer a one-time replacement for any account that fails to log in within the first 24 hours. Contact support immediately if you encounter issues.',
      highlight: '24h Replacement',
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: UserCheck,
      title: 'User Responsibility',
      description: 'Buyers are responsible for following platform guidelines (Meta/TikTok/Twitter) after a successful login. Account suspension due to violation of terms is not covered.',
      highlight: 'Follow Guidelines',
      color: 'text-cyan-400',
      bgColor: 'from-cyan-500/20 to-teal-500/20',
    },
  ];

  return (
    <section id="policy" className="py-20 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <FileText className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-blue-300">Please Read</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Refund & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Replacement</span> Policy
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Please read our policies carefully before making a purchase
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {policies.map((policy, index) => (
            <Card key={index} className="group bg-slate-950 border-blue-500/20 hover:border-cyan-500/40 transition-all duration-500">
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${policy.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <policy.icon className={`h-7 w-7 ${policy.color}`} />
                </div>
                <div className={`inline-block px-3 py-1 rounded-full bg-slate-900 text-xs font-medium ${policy.color} mb-4 border border-blue-500/20`}>
                  {policy.highlight}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {policy.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {policy.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-12 p-6 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-amber-300 mb-2">Important Notice</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                By purchasing from DeeDee's Marketplace, you agree to our terms and conditions. 
                We strongly recommend testing your account immediately upon receipt. 
                Any issues must be reported within 24 hours for replacement eligibility. 
                After 24 hours, all sales are final and no replacements will be issued.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
