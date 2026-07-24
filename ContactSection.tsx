import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, Clock, Shield, Headphones, Zap } from 'lucide-react';

export function ContactSection() {
  const whatsappNumbers = ['07046019436', '09035206681'];
  const supportNumbers = ['09035206681', '09139382082'];

  return (
    <section id="contact" className="py-20 bg-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <Headphones className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-blue-300">Get in Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Contact & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Order</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Ready to purchase? Reach out to us directly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Buttons */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-400" />
              Order via WhatsApp
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whatsappNumbers.map((number, index) => (
                <a 
                  key={number}
                  href={`https://wa.me/${number.replace(/^0/, '234')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-lg rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-105 hover:shadow-green-500/40"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    💬 Order {index + 1}
                    <span className="block text-xs mt-1 opacity-80">{number}</span>
                  </Button>
                </a>
              ))}
            </div>

            {/* Support Numbers */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-blue-400" />
                Support Lines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {supportNumbers.map((number) => (
                  <a 
                    key={number}
                    href={`tel:${number}`}
                    className="block"
                  >
                    <Card className="bg-slate-950 border-blue-500/20 hover:border-cyan-500/50 transition-all duration-300 group">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Phone className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{number}</p>
                          <p className="text-slate-400 text-sm">Click to call</p>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-4">
            <Card className="bg-slate-950 border-blue-500/20 group hover:border-cyan-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">24/7 Availability</h4>
                    <p className="text-slate-400">We're always available to meet your business needs. Place an order anytime, day or night.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 border-blue-500/20 group hover:border-cyan-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Secure Transactions</h4>
                    <p className="text-slate-400">All payments are verified and accounts are tested before delivery. Your security is our priority.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  <h4 className="text-lg font-semibold text-white">Why Choose DeeDee's Marketplace?</h4>
                </div>
                <ul className="space-y-3 text-slate-300">
                  {[
                    'Hand-picked clothes, bags, and books',
                    'Secure wallet-based checkout',
                    'Direct communication, no middlemen',
                    'Free educational videos on business & TikTok ads',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
