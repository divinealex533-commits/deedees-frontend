import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const scrollToCatalog = () => {
    const element = document.getElementById('catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span className="text-sm text-blue-300">100% Verified & Secure</span>
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
        </div>

        {/* Animated Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <span className="relative">
            DEEDEE'S
            <span className="absolute -inset-1 bg-blue-500/20 blur-xl rounded-full animate-pulse"></span>
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
            MARKETPLACE
          </span>
        </h1>

        {/* Animated Sub-headline */}
        <p className="text-xl sm:text-2xl text-slate-300 mb-2 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Social Media Growth in Nigeria 🇳🇬
        </p>
        <p className="text-lg text-slate-400 mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Real Growth for Nigerian Brands & Influencers
        </p>

        {/* Animated Body */}
        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          Join thousands of brands and influencers who have boosted their social media presence with DeeDee's Marketplace — real, reliable growth backed by secure wallet checkout.
        </p>

        {/* Animated Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
          {[
            { icon: CheckCircle, text: '24/7 Support', color: 'text-green-400' },
            { icon: CheckCircle, text: '100% Real Engagement', color: 'text-blue-400' },
            { icon: CheckCircle, text: 'Secure Payment', color: 'text-cyan-400' },
            { icon: CheckCircle, text: 'Fast Delivery', color: 'text-purple-400' },
          ].map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-300 group"
            >
              <badge.icon className={`h-5 w-5 ${badge.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* Animated CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
          <Button 
            size="lg"
            onClick={scrollToCatalog}
            className="relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <span className="relative flex items-center">
              Browse Accounts
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          <a 
            href="https://wa.me/07046019436"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              variant="outline"
              size="lg"
              className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105"
            >
              💬 Order via WhatsApp
            </Button>
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      
      {/* Animated corner accents */}
      <div className="absolute top-20 left-10 w-20 h-20 border-l-2 border-t-2 border-blue-500/20 rounded-tl-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-20 h-20 border-r-2 border-b-2 border-cyan-500/20 rounded-br-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
    </section>
  );
}
