import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface CTASectionProps {
  onGetStarted?: () => void;
}

export function CTASection({
  onGetStarted,
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 sm:py-20">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />

        <div
          className="
            absolute
            inset-0
            opacity-30
            [background-image:linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)]
            [background-size:60px_60px]
          "
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-300 sm:text-sm">
          <Zap className="h-4 w-4 text-cyan-400" />
          Ready to get started?
        </div>

        {/* Heading */}
        <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-6xl">
          Grow Your{' '}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Digital Presence
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Find what you need, place your order and enjoy a simple,
          secure marketplace experience with DeeDee's.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onGetStarted && (
            <button
              type="button"
              onClick={onGetStarted}
              className="
                group
                inline-flex
                w-full
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-r
                from-blue-500
                to-cyan-500
                px-7
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-blue-500/20
                transition-all
                duration-300
                hover:from-blue-600
                hover:to-cyan-600
                hover:shadow-xl
                hover:shadow-blue-500/25
                sm:w-auto
              "
            >
              Browse Marketplace
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          )}

          <a
            href="https://wa.me/07046019436"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-7
              py-3.5
              text-sm
              font-bold
              text-white
              backdrop-blur-sm
              transition-all
              duration-300
              hover:border-cyan-400/30
              hover:bg-cyan-400/10
              sm:w-auto
            "
          >
            <MessageCircle className="mr-2 h-4 w-4 text-cyan-400" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Trust points */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-400 sm:text-sm">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Secure checkout
          </span>

          <span className="hidden text-slate-700 sm:inline">•</span>

          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-cyan-400" />
            Fast processing
          </span>

          <span className="hidden text-slate-700 sm:inline">•</span>

          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 text-blue-400" />
            Helpful support
          </span>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
