import { Shield, MessageCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black border-t border-blue-500/20 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg opacity-75"></div>
                <div className="absolute inset-0.5 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-400 font-bold">DM</span>
                </div>
              </div>
              <div>
                <span className="text-white font-bold text-xl tracking-wide">DEEDEE'S</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-xl"> MARKET</span>
              </div>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Quality clothes, bags, and books — plus free educational videos on business and TikTok ads.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://wa.me/07046019436"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Services', id: 'services' },
                { label: 'Shop', id: 'catalog' },
                { label: 'Security', id: 'security' },
                { label: 'Policy', id: 'policy' },
                { label: 'Contact', id: 'contact' },
              ].map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => scrollToSection(link.id)} 
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-400">
              <li>WhatsApp: 07046019436</li>
              <li>WhatsApp: 09035206681</li>
              <li>Support: 09035206681</li>
              <li>Support: 09139382082</li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Available 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-500/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} DeeDee's Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Shield className="h-4 w-4 text-blue-400" />
            <span>100% Secure & Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
