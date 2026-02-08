export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-bg/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-xl font-bold tracking-wide">
          <span className="text-white">Ishq</span>
          <span className="text-primary">Risk</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <button className="hover:text-white transition">
            How it works
          </button>
          <button className="hover:text-white transition">
            Why IshqRisk
          </button>
          <button className="hover:text-white transition">
            Stories
          </button>
        </div>

        {/* CTA */}
        <button className="bg-primary text-black font-semibold px-5 py-2 rounded-full 
        hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
          Get Started
        </button>
      </div>
    </nav>
  );
}
