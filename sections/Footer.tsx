import {
  MessageCircle,
  Send,
  ShieldCheck,
  ArrowUp,
} from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pt-16 lg:px-8">

        {/* MAIN FOOTER */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* BRAND */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              type="button"
              onClick={scrollToTop}
              className="text-left"
            >
              <h2 className="text-2xl font-black tracking-tight">
                DEEDEE'S
                <span className="ml-1 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  MARKETPLACE
                </span>
              </h2>
            </button>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              A simple and reliable marketplace built to make buying
              digital products and services easier.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Secure &amp; trusted marketplace
            </div>
          </div>

          {/* MARKETPLACE */}
          <div>
            <h3 className="text-sm font-bold text-white">
              Marketplace
            </h3>

            <div className="mt-4 space-y-3">

              <a
                href="#catalog"
                className="block text-sm text-slate-400 transition-colors hover:text-cyan-400"
              >
                Browse Products
              </a>

              <a
                href="#how-it-works"
                className="block text-sm text-slate-400 transition-colors hover:text-cyan-400"
              >
                How It Works
              </a>

              <a
                href="#testimonials"
                className="block text-sm text-slate-400 transition-colors hover:text-cyan-400"
              >
                Customer Reviews
              </a>

              <a
                href="#faq"
                className="block text-sm text-slate-400 transition-colors hover:text-cyan-400"
              >
                FAQ
              </a>

            </div>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-sm font-bold text-white">
              Support
            </h3>

            <div className="mt-4 space-y-3">

              <a
                href="https://wa.me/07046019436"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-green-400"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Support
              </a>

              <a
                href="https://t.me/deedeesmarketsupport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400"
              >
                <Send className="h-4 w-4" />
                Telegram Support
              </a>

              <a
                href="#faq"
                className="block text-sm text-slate-400 transition-colors hover:text-cyan-400"
              >
                Frequently Asked Questions
              </a>

            </div>
          </div>

          {/* TRUST */}
          <div>
            <h3 className="text-sm font-bold text-white">
              Why DeeDee's?
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-400">

              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Secure checkout
              </p>

              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Reliable service
              </p>

              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Fast processing
              </p>

              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Customer support
              </p>

            </div>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="my-10 h-px bg-white/10" />

        {/* BOTTOM */}
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">

          <div className="text-center sm:text-left">
            <p className="text-xs text-slate-500 sm:text-sm">
              © {new Date().getFullYear()} DeeDee's Marketplace. All
              rights reserved.
            </p>

            <p className="mt-1 text-[11px] text-slate-600">
              Built for a simple, secure and reliable shopping experience.
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-blue-500/20
              bg-blue-500/10
              text-blue-400
              transition-all
              duration-300
              hover:border-cyan-400/40
              hover:bg-cyan-400/10
              hover:text-cyan-400
            "
          >
            <ArrowUp className="h-4 w-4" />
          </button>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
