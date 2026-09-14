import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MessageCircle,
  Phone,
  Clock,
  Shield,
  Headphones,
  Star,
  LifeBuoy,
  Send,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ALL_TESTIMONIALS = [
  {
    name: 'Chidinma A.',
    quote:
      'Grew my page way faster than I expected. Support actually replies too.',
  },
  {
    name: 'Emeka O.',
    quote:
      'Bought an account and it was exactly as described. No wahala at all.',
  },
  {
    name: 'Blessing U.',
    quote:
      'Reliable and secure — my go-to for social media growth in Nigeria now.',
  },
  {
    name: 'Tunde F.',
    quote:
      'Engagement felt real, not bot activity. My followers actually interact now.',
  },
  {
    name: 'Amaka N.',
    quote:
      'Fast delivery and the credentials worked immediately. Very smooth process.',
  },
  {
    name: 'Ibrahim S.',
    quote:
      'Been using them for months for my brand page. Consistent results every time.',
  },
  {
    name: 'Ngozi C.',
    quote:
      'Customer service was quick and actually helpful, not just automated replies.',
  },
  {
    name: 'Segun A.',
    quote:
      'Wallet checkout made everything easy. No stress moving money around.',
  },
  {
    name: 'Funke L.',
    quote:
      'My TikTok views jumped within days. Would recommend to any Nigerian creator.',
  },
  {
    name: 'David K.',
    quote:
      'Genuinely trustworthy. I was skeptical at first but they delivered exactly what was promised.',
  },
];

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function ContactSection() {
  const whatsappNumbers = ['07046019436', '09035206681'];
  const supportNumbers = ['09035206681', '09139382082'];

  const testimonials = useMemo(
    () => pickRandom(ALL_TESTIMONIALS, 3),
    []
  );

  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmittingTicket, setIsSubmittingTicket] =
    useState(false);

  const handleSubmitTicket = async () => {
    if (
      !ticketForm.name.trim() ||
      !ticketForm.email.trim() ||
      !ticketForm.subject.trim() ||
      !ticketForm.message.trim()
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmittingTicket(true);

      await api.createTicket(
        ticketForm.name.trim(),
        ticketForm.email.trim(),
        ticketForm.subject.trim(),
        ticketForm.message.trim()
      );

      toast.success(
        "Ticket submitted — we'll get back to you soon"
      );

      setTicketForm({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      toast.error(
        (err as Error).message ||
          'Could not submit ticket'
      );
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative py-14 sm:py-16 bg-slate-50 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 mb-3">
            <Headphones className="h-3.5 w-3.5 text-blue-500" />

            <span className="text-xs font-semibold text-blue-600">
              We're here to help
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Contact{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              DeeDee's
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-500">
            Need help, want to place an order, or have a question?
            Reach us directly.
          </p>
        </div>

        {/* CONTACT OPTIONS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsappNumbers[0].replace(
              /^0/,
              '234'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="h-full bg-white border-slate-200 hover:border-green-300 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  WhatsApp
                </h3>

                <p className="text-[11px] text-slate-500 mt-1">
                  Chat with us
                </p>
              </CardContent>
            </Card>
          </a>

          {/* Phone */}
          <a
            href={`tel:${supportNumbers[0]}`}
            className="group"
          >
            <Card className="h-full bg-white border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Call Us
                </h3>

                <p className="text-[11px] text-slate-500 mt-1">
                  Speak with support
                </p>
              </CardContent>
            </Card>
          </a>

          {/* Availability */}
          <div className="group">
            <Card className="h-full bg-white border-slate-200">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  24/7
                </h3>

                <p className="text-[11px] text-slate-500 mt-1">
                  Always available
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Security */}
          <div className="group">
            <Card className="h-full bg-white border-slate-200">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Secure
                </h3>

                <p className="text-[11px] text-slate-500 mt-1">
                  Safe transactions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* SUPPORT TICKET */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardContent className="p-5 sm:p-6">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Open a Support Ticket
                  </h3>

                  <p className="text-xs text-slate-500">
                    We'll get back to you as soon as possible.
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <div>
                    <Label className="text-xs text-slate-600">
                      Your Name
                    </Label>

                    <Input
                      value={ticketForm.name}
                      onChange={(e) =>
                        setTicketForm({
                          ...ticketForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Your name"
                      className="mt-1 bg-white border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-slate-600">
                      Email
                    </Label>

                    <Input
                      type="email"
                      value={ticketForm.email}
                      onChange={(e) =>
                        setTicketForm({
                          ...ticketForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="you@example.com"
                      className="mt-1 bg-white border-slate-200 text-slate-900"
                    />
                  </div>

                </div>

                {/* Subject */}
                <div>
                  <Label className="text-xs text-slate-600">
                    Subject
                  </Label>

                  <Input
                    value={ticketForm.subject}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        subject: e.target.value,
                      })
                    }
                    placeholder="What do you need help with?"
                    className="mt-1 bg-white border-slate-200 text-slate-900"
                  />
                </div>

                {/* Message */}
                <div>
                  <Label className="text-xs text-slate-600">
                    Message
                  </Label>

                  <textarea
                    value={ticketForm.message}
                    onChange={(e) =>
                      setTicketForm({
                        ...ticketForm,
                        message: e.target.value,
                      })
                    }
                    placeholder="Tell us what happened..."
                    rows={4}
                    className="mt-1 w-full bg-white border border-slate-200 text-slate-900 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmitTicket}
                  disabled={isSubmittingTicket}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />

                  {isSubmittingTicket
                    ? 'Submitting...'
                    : 'Submit Support Ticket'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT SIDE */}
          <div className="space-y-5">

            {/* ORDER DIRECTLY */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-5">

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Order Directly
                    </h3>

                    <p className="text-xs text-slate-500">
                      Chat with us on WhatsApp
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {whatsappNumbers.map(
                    (number, index) => (
                      <a
                        key={number}
                        href={`https://wa.me/${number.replace(
                          /^0/,
                          '234'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                          <MessageCircle className="w-4 h-4 mr-2" />

                          WhatsApp {index + 1}
                        </Button>

                        <p className="text-center text-[10px] text-slate-400 mt-1">
                          {number}
                        </p>
                      </a>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CUSTOMER REVIEWS */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-5">

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Customer Reviews
                    </h3>

                    <p className="text-xs text-slate-500">
                      What our customers say
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {testimonials.map(
                    (testimonial) => (
                      <div
                        key={testimonial.name}
                        className="rounded-xl bg-slate-50 border border-slate-100 p-4"
                      >
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map(
                            (_, index) => (
                              <Star
                                key={index}
                                className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                              />
                            )
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          "{testimonial.quote}"
                        </p>

                        <p className="text-xs font-semibold text-slate-900 mt-2">
                          — {testimonial.name}
                        </p>
                      </div>
                    )
                  )}
                </div>

              </CardContent>
            </Card>

          </div>
        </div>

        {/* SUPPORT NUMBERS */}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {supportNumbers.map((number) => (
            <a
              key={number}
              href={`tel:${number}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              {number}
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
