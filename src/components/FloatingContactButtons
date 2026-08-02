import { useState } from 'react';

const WHATSAPP_LINK = 'https://wa.me/2349035206681';
const TELEGRAM_LINK = 'https://t.me/deedeesmarketsupport';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.393.653 4.61 1.79 6.516L4 29l7.664-1.759A11.93 11.93 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm0 21.7a9.66 9.66 0 0 1-4.93-1.35l-.354-.21-4.55 1.044 1.06-4.44-.23-.365A9.66 9.66 0 0 1 5.3 15c0-5.906 4.795-10.7 10.701-10.7 5.905 0 10.7 4.794 10.7 10.7s-4.795 10.7-10.7 10.7Zm5.86-8.014c-.32-.16-1.9-.938-2.195-1.045-.294-.107-.508-.16-.722.16-.213.32-.827 1.044-1.014 1.259-.187.213-.373.24-.693.08-.32-.16-1.35-.498-2.572-1.588-.951-.848-1.593-1.895-1.78-2.216-.187-.32-.02-.492.14-.652.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.722-1.744-.99-2.39-.26-.626-.526-.542-.722-.552-.187-.008-.4-.01-.614-.01-.213 0-.56.08-.853.4-.293.32-1.12 1.096-1.12 2.674 0 1.578 1.147 3.102 1.307 3.316.16.213 2.256 3.446 5.466 4.832.764.33 1.36.527 1.826.674.767.244 1.465.21 2.017.128.615-.092 1.9-.777 2.168-1.526.267-.75.267-1.393.187-1.527-.08-.133-.293-.213-.613-.373Z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M16 3C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3Zm6.06 8.86-2.17 10.24c-.16.73-.6.91-1.21.57l-3.35-2.47-1.62 1.56c-.18.18-.33.33-.67.33l.24-3.4 6.2-5.6c.27-.24-.06-.37-.42-.13l-7.66 4.83-3.3-1.03c-.72-.22-.73-.72.15-1.07l12.9-4.97c.6-.22 1.12.14.91 1.14Z"/>
    </svg>
  );
}

export function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* WhatsApp */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={`flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'
        }`}
      >
        <WhatsAppIcon />
      </a>

      {/* Telegram */}
      <a
        href={TELEGRAM_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on Telegram"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#229ED9] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      >
        <TelegramIcon />
      </a>
    </div>
  );
}
