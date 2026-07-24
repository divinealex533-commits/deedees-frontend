import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, CheckCircle, Lock } from 'lucide-react';

export function SecuritySection() {
  const guarantees = [
    {
      icon: CheckCircle,
      title: 'Verified Only',
      description: 'Every account is hand-checked before delivery. We verify login credentials, account age, and activity history.',
      highlight: 'No Fake Accounts',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: 'Login Guarantee',
      description: 'We provide a 24-hour replacement window if you encounter any login issues. Your satisfaction is our priority.',
      highlight: '24h Replacement',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'No Middlemen',
      description: 'You are dealing directly with DeeDee\'s Market. 100% Transparency. No hidden fees, no surprises.',
      highlight: 'Direct Contact',
      color: 'from-cyan-500 to-teal-500',
    },
  ];

  return (
    <section id="security" className="py-20 bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <Lock className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-blue-300">Very Important</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Security</span> Guarantee
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your trust is our most valuable asset. Here's how we protect your investment.
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guarantees.map((guarantee, index) => (
            <Card key={index} className="group bg-black border-blue-500/20 hover:border-cyan-500/40 transition-all duration-500 overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${guarantee.color}`}></div>
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${guarantee.color} bg-opacity-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <guarantee.icon className="h-7 w-7 text-white" />
                </div>
                <div className={`inline-block px-3 py-1 rounded-full bg-slate-900 text-xs font-medium text-transparent bg-clip-text bg-gradient-to-r ${guarantee.color} mb-4 border border-blue-500/20`}>
                  {guarantee.highlight}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {guarantee.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {guarantee.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Banner */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-white">100% Secure Transactions</h4>
                <p className="text-slate-400">All accounts are tested and verified before delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-sm">Trusted by</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">500+</span>
              <span className="text-sm">customers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
