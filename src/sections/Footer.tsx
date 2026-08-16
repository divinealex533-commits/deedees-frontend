import {
  MessageCircle,
  Phone,
  ShieldCheck,
  ArrowUp,
  Heart,
  ShoppingBag,
  Mail,
} from 'lucide-react';

const whatsappNumber = '07046019436';
const supportNumber = '09035206681';

export function Footer() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const goHome = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const whatsappLink = `https://wa.me/${whatsappNumber.replace(
    /^0/,
    '234'
  )}`;

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MAIN FOOTER */}
        <div className="py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* BRAND */}
          <div className="col-span-2 md:col-span-1">

            <button
              type="button"
              onClick={goHome}
              className="text-left group"
            >
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:scale-[1.02] transition-transform">
                DEEDEE'S
              </div>

              <div className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">
                MARKETPLACE
              </div>
            </button>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-400 max-w-xs">
              Your trusted marketplace for digital products,
              social media growth services and more.
            </p>

            {/* Mini trust badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />

              <span className="text-[11px] text-slate-300">
                Secure & Trusted
              </span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>

            <div className="space-y-2.5">

              <button
                type="button"
                onClick={goHome}
                className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => scrollTo('catalog')}
                className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Products
              </button>

              <button
                type="button"
                onClick={() => scrollTo('contact')}
                className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Contact
              </button>

              <button
                type="button"
                onClick={() => scrollTo('policy')}
                className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Policies
              </button>
            </div>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Support
            </h3>

            <div className="space-y-3">

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>

              <a
                href={`tel:${supportNumber}`}
                className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Support
              </a>

              <a
                href={`mailto:deedeesmarketagent@gmail.com`}
                className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>

            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Contact Us
            </h3>

            <div className="space-y-3">

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  WhatsApp
                </p>

                <p className="text-xs sm:text-sm text-slate-300">
                  {whatsappNumber}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  Phone
                </p>

                <p className="text-xs sm:text-sm text-slate-300">
                  {supportNumber}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  Location
                </p>

                <p className="text-xs sm:text-sm text-slate-300">
                  Nigeria 🇳🇬
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* TRUST STRIP */}
        <div className="border-y border-slate-800 py-4">

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Secure Checkout
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              Quality Products
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              Customer Support
            </div>

          </div>
        </div>

        {/* BOTTOM */}
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-[10px] sm:text-[11px] text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} DeeDee's Marketplace.
            All rights reserved.
          </p>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
            Made with
            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
            for Nigerian customers 🇳🇬
          </div>

          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Back to top
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </footer>
  );
}
