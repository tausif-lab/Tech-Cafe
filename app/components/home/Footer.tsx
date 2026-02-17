export default function Footer() {
  return (
    <footer className="bg-[#1F3A2E] text-neutral-400 py-12 px-6 border-t border-neutral-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold text-white mb-2">Clever Codex</h3>
          <p className="text-sm">
            Building scalable digital systems for modern businesses.
          </p>
          <p className="text-xs mt-2">
            Web Development • System Design • App Development • SEO Optimisation
          </p>
        </div>

        <div className="text-center">
          <p className="font-mono text-cyan-500 mb-1">CONNECT WITH US</p>
          <p className="text-xs">Instagram: @tautumhre</p>
          <p className="text-xs">Email: hr@clevercodex.site</p>
          <p className="text-xs">Let’s build something powerful.</p>
        </div>

        <div className="flex gap-4 text-sm">
          <a 
            href="https://instagram.com/tautumhre" 
            target="_blank" 
            className="hover:text-white transition-colors"
          >
            Instagram
          </a>
          <a 
            href="mailto:hr@clevercodex.site" 
            className="hover:text-white transition-colors"
          >
            Email
          </a>
          <a 
            href="mailto:hr@clevercodex.site" 
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
      
      <div className="mt-12 text-center text-xs text-neutral-700">
        © {new Date().getFullYear()} Clever Codex. Engineering Digital Growth.
      </div>
    </footer>
  );
}
