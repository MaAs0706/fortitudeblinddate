import Navbar from "../components/layout/Navbar";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-bg overflow-hidden">
      <Navbar />

      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 
        w-[600px] h-[600px] bg-primary/20 rounded-full blur-[160px]" />
        
        <div className="absolute bottom-[-200px] right-[-100px] 
        w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px]" />
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-3xl text-center mt-24">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 
          rounded-full border border-white/10 text-sm text-muted">
            💬 Where real connections begin
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6 font-[Playfair Display]">
            Love Starts with a{" "}
            <span className="text-primary">Conversation</span>
          </h1>

          {/* Subtext */}
          <p className="text-muted text-base md:text-lg mb-10">
            No photos. No superficial judgments.  
            Just two people talking — and seeing where it goes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-primary text-black font-semibold px-8 py-3 rounded-full 
              hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/30 
              transition-all duration-300"
            >
              Start a Blind Date →
            </button>

            <button
              className="border border-white/15 text-white px-8 py-3 rounded-full 
              hover:bg-white/5 hover:scale-[1.02] transition-all duration-300"
            >
              See How It Works
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
