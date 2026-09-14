import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({
  onGetStarted,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white pt-20 sm:pt-24">
      {/* Soft background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="absolute -right-40 top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-50 blur-3xl" />

        {/* subtle grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(#0f172a_1px,transparent_1px),linear-gradient(90deg,#0f172a_1px,transparent_1px)]
            [background-size:55px_55px]
          "
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          
          {/* LEFT SIDE */}
          <div className="text-center lg:text-left">

            {/* Trust badge */}
            <div
              className="
                mb-7
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-200
                bg-emerald-50
                px-4
                py-2
                text-sm
                font-bold
                text-emerald-700
                shadow-sm
              "
            >
              <Sparkles className="h-4 w-4 text-emerald-500" />

              <span>
                Trusted Nigerian Marketplace
              </span>

              <span className="text-base">
                🇳🇬
              </span>
            </div>

            {/* Main heading */}
            <h1
              className="
                text-4xl
                font-black
                leading-[1.05]
                tracking-tight
                text-slate-950
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
              "
            >
              Grow Your
              <br />

              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 bg-clip-text text-transparent">
                Digital Presence
              </span>

              <br />

              With DeeDee's.
            </h1>

            {/* Subtitle */}
            <p
              className="
                mx-auto
                mt-6
                max-w-2xl
                text-lg
                font-medium
                leading-8
                text-slate-600
                sm:text-xl
                lg:mx-0
              "
            >
              Discover reliable digital products and social
              media services designed for Nigerian brands,
              creators and businesses.
            </p>

            {/* Quick benefits */}
            <div
              className="
                mt-7
                flex
                flex-wrap
                justify-center
                gap-x-5
                gap-y-3
                lg:justify-start
              "
            >
              {[
                'Secure Checkout',
                'Fast Delivery',
                '24/7 Support',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div
              className="
                mt-9
                flex
                flex-col
                items-center
                justify-center
                gap-3
                sm:flex-row
                lg:justify-start
              "
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="
                  group
                  h-14
                  w-full
                  rounded-2xl
                  bg-gradient-to-r
                  from-emerald-500
                  to-teal-500
                  px-7
                  text-base
                  font-bold
                  text-white
                  shadow-lg
                  shadow-emerald-500/20
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:from-emerald-600
                  hover:to-teal-600
                  hover:shadow-xl
                  hover:shadow-emerald-500/25
                  sm:w-auto
                "
              >
                <span>Explore Marketplace</span>

                <ArrowRight
                  className="
                    ml-2
                    h-5
                    w-5
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Button>

              <a
                href="https://wa.me/07046019436"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="
                    h-14
                    w-full
                    rounded-2xl
                    border-slate-200
                    bg-white
                    px-7
                    text-base
                    font-bold
                    text-slate-800
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-emerald-200
                    hover:bg-emerald-50
                    hover:text-emerald-700
                    sm:w-auto
                  "
                >
                  💬 Chat on WhatsApp
                </Button>
              </a>
            </div>

            {/* Small trust line */}
            <div className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-400 lg:justify-start">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />

              <span>
                Secure wallet-powered checkout
              </span>
            </div>
          </div>

          {/* RIGHT SIDE — MARKETPLACE PREVIEW */}
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            
            {/* Main card */}
            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-slate-200
                bg-white
                p-5
                shadow-[0_25px_80px_rgba(15,23,42,0.12)]
                sm:p-7
              "
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-400">
                    DeeDee's Marketplace
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                    Find what you need
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Search className="h-5 w-5" />
                </div>
              </div>

              {/* Fake search preview */}
              <div
                className="
                  mt-6
                  flex
                  h-12
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                "
              >
                <Search className="h-5 w-5 text-slate-400" />

                <span className="text-sm text-slate-400">
                  Search for products or services...
                </span>
              </div>

              {/* Mini categories */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  {
                    icon: '📱',
                    title: 'Social',
                  },
                  {
                    icon: '🎮',
                    title: 'Gaming',
                  },
                  {
                    icon: '💻',
                    title: 'Digital',
                  },
                ].map((category) => (
                  <div
                    key={category.title}
                    className="
                      rounded-2xl
                      border
                      border-slate-100
                      bg-slate-50
                      p-4
                      text-center
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-emerald-100
                      hover:bg-emerald-50
                    "
                  >
                    <div className="text-2xl">
                      {category.icon}
                    </div>

                    <p className="mt-2 text-xs font-bold text-slate-700">
                      {category.title}
                    </p>
                  </div>
                ))}
              </div>

              {/* Product preview */}
              <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 text-2xl">
                    📈
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                        POPULAR
                      </span>
                    </div>

                    <h3 className="mt-1 truncate text-sm font-extrabold text-slate-900">
                      Social Media Growth
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Fast & reliable service
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-900">
                      ₦
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-500">
                      ★ 5.0
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom mini trust */}
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Secure
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Protected checkout
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Fast
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Quick delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge — top right */}
            <div
              className="
                absolute
                -right-3
                -top-5
                hidden
                rounded-2xl
                border
                border-emerald-100
                bg-white
                px-4
                py-3
                shadow-lg
                sm:block
              "
            >
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    Verified
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Trusted marketplace
                  </p>
                </div>
              </div>
            </div>

            {/* Floating badge — bottom left */}
            <div
              className="
                absolute
                -bottom-5
                -left-3
                hidden
                rounded-2xl
                border
                border-blue-100
                bg-white
                px-4
                py-3
                shadow-lg
                sm:block
              "
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['1', '2', '3'].map((avatar) => (
                    <div
                      key={avatar}
                      className="
                        h-8
                        w-8
                        rounded-full
                        border-2
                        border-white
                        bg-gradient-to-br
                        from-emerald-400
                        to-blue-500
                      "
                    />
                  ))}
                </div>

                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    Happy Customers
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Growing with DeeDee's
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div
          className="
            mx-auto
            mt-16
            grid
            max-w-4xl
            grid-cols-2
            overflow-hidden
            rounded-3xl
            border
            border-slate-100
            bg-white
            shadow-sm
            sm:grid-cols-4
          "
        >
          {[
            {
              value: '24/7',
              label: 'Support',
            },
            {
              value: '100%',
              label: 'Secure',
            },
            {
              value: 'Fast',
              label: 'Delivery',
            },
            {
              value: '🇳🇬',
              label: 'Nigeria',
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`
                px-4
                py-5
                text-center
                sm:py-6
                ${
                  index !== 0
                    ? 'border-l border-slate-100'
                    : ''
                }
                ${
                  index === 2
                    ? 'border-t border-slate-100 sm:border-t-0'
                    : ''
                }
                ${
                  index === 3
                    ? 'border-t border-slate-100 sm:border-t-0'
                    : ''
                }
              `}
            >
              <p className="text-xl font-black text-slate-900 sm:text-2xl">
                {stat.value}
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-400 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/70 to-transparent" />
    </section>
  );
}
