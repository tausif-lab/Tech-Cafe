const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  `}</style>
);

export default function Footer() {
  return (
    <>
      <FontLoader />
      
      <footer 
        className="text-[#E8E1CF] py-16 px-6"
        style={{ 
          backgroundColor: '#1F3A2E',
          borderTop: '2px solid rgba(232,225,207,0.12)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Brand Section */}
            <div>
              <p
                className="text-[9px] tracking-[0.55em] uppercase mb-3"
                style={{ 
                  fontFamily: "'Plus Jakarta Sans', sans-serif", 
                  color: "rgba(232,225,207,0.3)" 
                }}
              >
                Digital Engineering
              </p>
              <h3 
                className="font-extrabold uppercase leading-none mb-4"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(1.6rem, 3vw, 2rem)",
                  letterSpacing: "-0.02em",
                  color: "#E8E1CF",
                }}
              >
                Clever Codex
              </h3>
              <p 
                className="text-sm mb-2 leading-relaxed"
                style={{ 
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.5)"
                }}
              >
                Building scalable digital systems for modern businesses.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Web Dev', 'System Design', 'App Dev', 'SEO'].map((service) => (
                  <span
                    key={service}
                    className="text-[8px] tracking-[0.4em] uppercase px-2.5 py-1"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "#D94B4B",
                      border: "1px solid rgba(217,75,75,0.25)",
                      borderRadius: "2px",
                    }}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Connect Section */}
            <div>
              <p
                className="text-[9px] tracking-[0.55em] uppercase mb-4"
                style={{ 
                  fontFamily: "'Plus Jakarta Sans', sans-serif", 
                  color: "rgba(232,225,207,0.3)" 
                }}
              >
                Connect With Us
              </p>
              <div className="flex flex-col gap-3">
                <div 
                  className="flex items-start gap-3 py-2"
                  style={{ borderBottom: "1px solid rgba(232,225,207,0.08)" }}
                >
                  <span 
                    className="text-[10px] tracking-[0.35em] uppercase"
                    style={{ 
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "rgba(232,225,207,0.25)",
                      minWidth: "80px"
                    }}
                  >
                    Instagram
                  </span>
                  <a 
                    href="https://instagram.com/tautumhre"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold hover:text-[#D94B4B] transition-colors"
                    style={{ 
                      fontFamily: "'Syne', sans-serif",
                      color: "#E8E1CF"
                    }}
                  >
                    @tautumhre
                  </a>
                </div>
                
                <div 
                  className="flex items-start gap-3 py-2"
                  style={{ borderBottom: "1px solid rgba(232,225,207,0.08)" }}
                >
                  <span 
                    className="text-[10px] tracking-[0.35em] uppercase"
                    style={{ 
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "rgba(232,225,207,0.25)",
                      minWidth: "80px"
                    }}
                  >
                    Email
                  </span>
                  <a 
                    href="mailto:hr@clevercodex.site"
                    className="text-sm font-semibold hover:text-[#D94B4B] transition-colors"
                    style={{ 
                      fontFamily: "'Syne', sans-serif",
                      color: "#E8E1CF"
                    }}
                  >
                    hr@clevercodex.site
                  </a>
                </div>

                <div className="flex items-start gap-3 py-2">
                  <span 
                    className="text-[10px] tracking-[0.35em] uppercase"
                    style={{ 
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: "rgba(232,225,207,0.25)",
                      minWidth: "80px"
                    }}
                  >
                    Motto
                  </span>
                  <p 
                    className="text-sm font-semibold"
                    style={{ 
                      fontFamily: "'Syne', sans-serif",
                      color: "rgba(232,225,207,0.5)"
                    }}
                  >
                    Let's build something powerful.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p
                className="text-[9px] tracking-[0.55em] uppercase mb-4"
                style={{ 
                  fontFamily: "'Plus Jakarta Sans', sans-serif", 
                  color: "rgba(232,225,207,0.3)" 
                }}
              >
                Quick Links
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Instagram', href: 'https://instagram.com/tautumhre', external: true },
                  { label: 'Email Us', href: 'mailto:hr@clevercodex.site', external: false },
                  { label: 'Contact', href: 'mailto:hr@clevercodex.site', external: false },
                  { label: 'Portfolio', href: '#', external: false },
                ].map(({ label, href, external }) => (
                  <a
                    key={label}
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-2 py-1.5 hover:translate-x-1 transition-transform duration-200"
                  >
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                      className="text-[#D94B4B]"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span
                      className="text-sm font-semibold group-hover:text-[#D94B4B] transition-colors"
                      style={{ 
                        fontFamily: "'Syne', sans-serif",
                        color: "rgba(232,225,207,0.5)"
                      }}
                    >
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div 
            style={{ 
              borderTop: "2px solid rgba(232,225,207,0.1)",
              margin: "24px 0"
            }} 
          />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="text-[10px] tracking-[0.35em] uppercase text-center"
              style={{ 
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: "rgba(232,225,207,0.3)"
              }}
            >
              © {new Date().getFullYear()} Clever Codex &bull; Engineering Digital Growth
            </p>
            
            <div className="flex items-center gap-2">
              <span
                className="text-[8px] tracking-[0.4em] uppercase px-2.5 py-1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "rgba(232,225,207,0.4)",
                  border: "1px solid rgba(232,225,207,0.15)",
                  borderRadius: "2px",
                }}
              >
                Made with ❤️
              </span>
              <span
                className="text-[8px] tracking-[0.4em] uppercase px-2.5 py-1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: "#D94B4B",
                  border: "1px solid rgba(217,75,75,0.25)",
                  borderRadius: "2px",
                }}
              >
                Open for Projects
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}