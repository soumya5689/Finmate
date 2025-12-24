import { Link } from "react-router-dom";
import {
  UploadCloud,
  Sparkles,
  BarChart3,
  ArrowRight,
  Github,
  Linkedin,
  Twitter
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1020] text-white">

      {/* Ambient Background */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/25 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-600/25 rounded-full blur-[140px]" />

      {/* Subtle Grid Texture */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Radial Fade */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide text-indigo-400">
          Finmate
        </h1>
        <Link
          to="/upload"
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30"
        >
          Get Started
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-32 text-center">
        <h2 className="text-6xl font-extrabold leading-tight tracking-tight">
          Financial Clarity <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
            Starts With Your Data
          </span>
        </h2>

        <p className="mt-8 text-xl text-gray-300 max-w-3xl mx-auto">
          Finmate transforms messy bank statements into structured expenses,
          intelligent categories, and actionable financial insights.
        </p>

        <div className="mt-14 flex justify-center gap-6">
          <Link
            to="/upload"
            className="
              group inline-flex items-center gap-3
              px-10 py-5 rounded-2xl
              bg-gradient-to-r from-indigo-600 to-indigo-500
              text-lg font-semibold
              shadow-[0_25px_70px_rgba(99,102,241,0.45)]
              hover:shadow-[0_40px_100px_rgba(99,102,241,0.65)]
              transition-all duration-300
              hover:-translate-y-1
            "
          >
            Upload Statement
            <ArrowRight size={20} />
          </Link>

          <Link
            to="/dashboard"
            className="
              px-10 py-5 rounded-2xl
              border border-white/20
              text-lg
              hover:bg-white/10
              transition
            "
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-24">
        <div className="grid md:grid-cols-3 gap-10">
          <EnhancedGlassCard
            icon={<UploadCloud />}
            title="Upload Raw Data"
            desc="Import Excel bank statements without worrying about format or structure."
          />
          <EnhancedGlassCard
            icon={<Sparkles />}
            title="Smart Categorization"
            desc="Expenses are grouped using intelligent logic, not hard-coded rules."
          />
          <EnhancedGlassCard
            icon={<BarChart3 />}
            title="Actionable Insights"
            desc="Analyze spending patterns with clean dashboards and summaries."
          />
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10 max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />

      {/* VALUE SECTION */}
      <section className="relative z-10 py-32">
        <div className="max-w-6xl mx-auto px-6">

          <h3 className="text-4xl md:text-5xl font-extrabold text-center tracking-tight">
            Built for <span className="text-indigo-400">Real Bank Data</span>
          </h3>

          <p className="mt-6 text-lg text-gray-300 text-center max-w-3xl mx-auto">
            Finmate is designed for real-world bank statements — not clean demo data.
            Upload raw exports and get structured, reliable insights instantly.
          </p>

          <div className="mt-20 grid md:grid-cols-3 gap-10">
            <ValueCard
              title="Works With Any Excel"
              desc="Upload raw bank exports directly. No strict templates or formatting needed."
            />
            <ValueCard
              title="Intelligent Categorization"
              desc="Expenses are grouped using similarity and logic — not fragile keyword lists."
            />
            <ValueCard
              title="Built for Analysis"
              desc="Get dashboards and outputs you can actually use for decisions."
            />
          </div>

          {/* ✅ FIXED SOCIAL ICONS */}
          <div className="mt-24 flex flex-col items-center gap-6">
            <p className="text-sm uppercase tracking-widest text-gray-400">
              Built in public · Open & Transparent
            </p>

            <div className="flex items-center gap-10">
              <a
                href="https://github.com/soumya5689"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition"
              >
                <Github size={28} />
              </a>

              <a
                href="https://www.linkedin.com/in/soumya-kanta-sahoo/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition"
              >
                <Linkedin size={28} />
              </a>

              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition"
              >
                <Twitter size={28} />
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

/* Feature Card */
function EnhancedGlassCard({
  icon,
  title,
  desc
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="
        group relative
        rounded-3xl p-8
        backdrop-blur-xl bg-white/8
        border border-white/15
        transition-all duration-300
        hover:-translate-y-2
        hover:shadow-[0_30px_90px_rgba(99,102,241,0.35)]
      "
    >
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100
                      bg-gradient-to-br from-indigo-500/15 to-purple-500/15 transition" />

      <div className="relative z-10">
        <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-2xl
                        bg-indigo-600/20 text-indigo-400">
          {icon}
        </div>

        <h4 className="text-xl font-semibold">{title}</h4>
        <p className="mt-4 text-gray-300 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

/* Value Card */
function ValueCard({
  title,
  desc
}: {
  title: string;
  desc: string;
}) {
  return (
    <div
      className="
        relative rounded-3xl p-8
        backdrop-blur-xl bg-white/8
        border border-white/15
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-[0_25px_80px_rgba(99,102,241,0.35)]
      "
    >
      <h4 className="text-xl font-semibold text-indigo-300">
        {title}
      </h4>
      <p className="mt-4 text-gray-300 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
