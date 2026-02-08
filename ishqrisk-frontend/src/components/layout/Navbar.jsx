export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 left-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div
          className="
            flex items-center justify-between
            rounded-full
            bg-background/70
            backdrop-blur-xl
            border border-border
            px-6 py-3
          "
        >
          {/* Logo */}
          <div className="text-xl font-bold tracking-wide">
            <span className="text-foreground">Ishq</span>
            <span className="text-primary">Risk</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition">
              How it works
            </button>
            <button className="hover:text-foreground transition">
              Why IshqRisk
            </button>
            <button className="hover:text-foreground transition">
              Stories
            </button>
          </div>

          {/* CTA */}
          <button
            className="
              bg-primary
              text-primary-foreground
              font-semibold
              px-5 py-2
              rounded-full
              hover:scale-[1.04]
              hover:shadow-xl
              hover:shadow-primary/40
              transition-all
              duration-300
            "
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
