import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I place an order?',
    answer:
      "Simply browse the marketplace, choose the product you want, select the quantity, and click Buy. You'll then be taken through the secure checkout process.",
  },
  {
    question: 'How do I fund my wallet?',
    answer:
      'You can add funds using the available instant payment option during checkout. You can also use the manual bank transfer option and submit your payment screenshot for review.',
  },
  {
    question: 'Is my payment secure?',
    answer:
      'Yes. Payments are handled through secure payment processing, and your wallet balance is used within the marketplace checkout system.',
  },
  {
    question: 'How quickly will I receive my order?',
    answer:
      'Orders are processed as quickly as possible after successful payment confirmation. Delivery time can vary depending on the product you purchase.',
  },
  {
    question: 'What happens if I have a problem with my order?',
    answer:
      'Our support team is available to help. You can contact support if you need assistance with payment, an order, or accessing your purchase.',
  },
  {
    question: 'Can I contact support before placing an order?',
    answer:
      'Absolutely. If you have questions about a product or the ordering process, you can contact our support team before making a purchase.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-slate-50 py-16 sm:py-20"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-[600px] rounded-full bg-blue-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 sm:text-sm">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </div>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Got{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Questions?
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Here are answers to some of the questions customers ask most
            often.
          </p>
        </div>

        {/* FAQ list */}
        <div className="mt-10 space-y-3 sm:mt-12">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`
                  overflow-hidden
                  rounded-2xl
                  border
                  bg-white
                  transition-all
                  duration-300
                  ${
                    isOpen
                      ? 'border-blue-300 shadow-lg shadow-blue-500/5'
                      : 'border-slate-200 shadow-sm hover:border-blue-200'
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                >
                  <span className="text-sm font-bold text-slate-900 sm:text-base">
                    {faq.question}
                  </span>

                  <span
                    className={`
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-full
                      transition-all
                      duration-300
                      ${
                        isOpen
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-50 text-blue-500'
                      }
                    `}
                  >
                    <ChevronDown
                      className={`
                        h-4 w-4
                        transition-transform
                        duration-300
                        ${isOpen ? 'rotate-180' : ''}
                      `}
                    />
                  </span>
                </button>

                <div
                  className={`
                    grid transition-all duration-300 ease-in-out
                    ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-6 text-slate-500 sm:px-6 sm:pb-6">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom support CTA */}
        <div className="mt-10 rounded-2xl border border-blue-100 bg-white p-5 text-center shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-800 sm:text-base">
            Still have a question?
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Our support team is ready to help you with your order.
          </p>

          <a
            href="https://t.me/deedeesmarketsupport"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:from-blue-600 hover:to-cyan-600 hover:shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
