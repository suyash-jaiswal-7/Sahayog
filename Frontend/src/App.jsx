import electricianImg from "./assets/workers/electrician.png";
import plumberImg from "./assets/workers/plumber.png";
import sanitationImg from "./assets/workers/sanitation.png";
import logo from './assets/logo.png'
import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";

// AuthPage contains frontend-only authentication UI for now.
// Backend teammates can later connect its forms to the relevant
// Customer, Worker, and Cooperative Owner authentication endpoints.
function App() {
  const [showAuth, setShowAuth] = useState(
  window.location.hash === "#auth"
);
// Keep React state synchronized with the browser's
// Back and Forward buttons.
useEffect(() => {
  const handlePopState = () => {
    setShowAuth(window.location.hash === "#auth");
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);
  const workers = [
  {
    role: "Electrician",
    description: "Electrical services",
    image: electricianImg,
  },
  {
    role: "Plumber",
    description: "Plumbing services",
    image: plumberImg,
  },
  {
    role: "Sanitation Worker",
    description: "Cleaning & sanitation",
    image: sanitationImg,
  },
];
const [workerIndex, setWorkerIndex] = useState(0);
useEffect(() => {
  const interval = setInterval(() => {
    setWorkerIndex((current) => (current + 1) % workers.length);
  }, 3000);

  return () => clearInterval(interval);
}, []);

const currentWorker = workers[workerIndex];

  // Authentication screen is rendered after all App hooks have run.
  // This keeps React Hook order consistent across renders.
  if (showAuth) {
  return (
    <AuthPage
      onBackHome={() => {
        window.history.replaceState({}, "", window.location.pathname);
        setShowAuth(false);
      }}
    />
  );
}

  return (
    <div className="min-h-screen bg-[#f8fbfd] text-[#12345b]">




      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 border-b border-[#dce8e3] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
            src={logo}
            alt="Sahayog Logo"
            className="h-12 w-12 object-contain"/>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#12345b]">
                Sahayog
              </h1>
              <p className="text-xs text-gray-500">
                People • Skills • Stronger Communities
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-sm font-medium text-[#16845f]">
              Home
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-gray-700 transition hover:text-[#16845f]"
            >
              About
            </a>

            <a
              href="#team"
              className="text-sm font-medium text-gray-700 transition hover:text-[#16845f]"
            >
              Our Team
            </a>

            <a
              href="#github"
              className="text-sm font-medium text-gray-700 transition hover:text-[#16845f]"
            >
              GitHub
            </a>
          </div>

          <button 
          onClick={() => {
  window.history.pushState(
    { page: "auth" },
    "",
    "#auth"
  );
  setShowAuth(true);
}}
          className="rounded-full bg-[#e67e22] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#11704f]">
            Get Started
          </button>
        </div>
      </nav>


      {/* Hero */}
<section
  id="home"
  className="relative isolate overflow-hidden bg-[#f8fbfd] px-6 pb-16 pt-12 sm:pb-20 sm:pt-16"
>
  {/* Soft background shapes */}
  <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#e67e22]/10 blur-3xl" />

  <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#dceaf5] blur-3xl" />

  <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">

    {/* ================= LEFT CONTENT ================= */}
    <div className="max-w-2xl">

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe4da] bg-white px-4 py-2 text-sm font-semibold text-[#16845f] shadow-sm">
        <span className="h-2 w-2 rounded-full bg-[#e67e22]" />
        A Cooperative-Owned Initiative
      </div>

      {/* Heading */}
      <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-[#12345b] sm:text-6xl lg:text-[4.3rem]">
        Empowering Skills.
        <span className="block text-[#16845f]">
          Connecting Communities.
        </span>
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-xl text-lg leading-8 text-[#526b86]">
        Sahayog connects skilled cooperative workers with households and
        communities, creating trusted opportunities, fair work, and stronger
        local connections.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">

        <button
          onClick={() => setShowAuth(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#e67e22] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#16845f]/20 transition hover:-translate-y-0.5 hover:bg-[#11704f]"
        >
          Get Started
        </button>

        <a
          href="#about"
          className="inline-flex items-center justify-center rounded-xl border border-[#d4e0e8] bg-white px-7 py-3.5 font-semibold text-[#12345b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#16845f] hover:text-[#16845f]"
        >
          Learn More
        </a>

      </div>

      {/* Trust indicators */}
      <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#526b86]">

        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f5ec] text-xs font-bold text-[#16845f]">
            ✓
          </span>
          Verified Workers
        </span>

        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f5ec] text-xs font-bold text-[#16845f]">
            ✓
          </span>
          Fair Opportunities
        </span>

        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f5ec] text-xs font-bold text-[#16845f]">
            ✓
          </span>
          Community First
        </span>

      </div>
    </div>


    {/* ================= RIGHT VISUAL ================= */}
    <div className="relative mx-auto w-full max-w-xl">

      {/* Decorative circles */}
      <div className="absolute -left-6 top-10 h-20 w-20 rounded-full bg-[#e67e22]/10" />

      <div className="absolute -right-5 bottom-16 h-28 w-28 rounded-full bg-[#12345b]/10" />

      {/* Main visual card */}
      <div className="relative mx-auto flex aspect-square max-w-[480px] items-center justify-center">

        {/* Large circular background */}
        <div className="absolute inset-8 rounded-full bg-[#eaf5f0]" />

        {/* Inner circle */}
        <div className="absolute inset-20 rounded-full bg-white shadow-xl" />

        {/* Worker placeholder */}
        <div className="worker-visual relative flex h-64 w-64 flex-col items-center justify-end overflow-hidden rounded-[45%] bg-[#12345b] shadow-2xl sm:h-72 sm:w-72">

          <img
  key={currentWorker.role}
  src={currentWorker.image}
  alt={currentWorker.role}
  className="worker-image h-60 w-auto object-contain sm:h-72"
/>
          <div className="absolute bottom-4 z-20 text-center text-white">
  <p className="text-lg font-bold">{currentWorker.role}</p>
  <p className="text-xs text-white/70">{currentWorker.description}</p>
</div>

        </div>


        {/* Floating card — worker */}
        <div className="glass-card absolute left-0 top-24 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-md sm:left-2">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f5ec] text-[#16845f]">
              <span className="text-lg">✓</span>
            </div>

            <div>
              <p className="text-xs text-[#7a8da3]">
                Trusted
              </p>

              <p className="text-sm font-bold text-[#12345b]">
                Skilled Workers
              </p>
            </div>

          </div>

        </div>


        {/* Floating card — community */}
        <div className="glass-card absolute bottom-20 right-0 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-xl backdrop-blur-md">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f0fb] text-[#2e6fb0]">
              <span className="text-lg">●</span>
            </div>

            <div>
              <p className="text-xs text-[#7a8da3]">
                Built for
              </p>

              <p className="text-sm font-bold text-[#12345b]">
                Communities
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>

  </div>
</section>


      {/* ================= ABOUT ================= */}
      {/* About */}
<section
  id="about"
  className="bg-white px-6 py-20 sm:py-24"
>
  <div className="mx-auto max-w-6xl">

    {/* Section heading */}
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#16845f]">
        About Sahayog
      </p>

      <h2 className="text-4xl font-bold tracking-tight text-[#12345b] sm:text-5xl">
        Skills deserve opportunity.
        <span className="block text-[#16845f]">
          Communities deserve trust.
        </span>
      </h2>

      <p className="mt-6 text-lg leading-8 text-[#526b86]">
        Sahayog is a cooperative-owned digital platform designed to connect
        skilled workers with households and institutions in a trusted,
        transparent, and community-driven way.
      </p>
    </div>

    {/* Problem → Solution */}
    <div className="mt-14 grid gap-6 md:grid-cols-2">

      {/* Problem */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
          ⚠️
        </div>

        <h3 className="text-2xl font-bold text-[#12345b]">
          The Challenge
        </h3>

        <p className="mt-4 leading-7 text-[#526b86]">
          Skilled cooperative workers often lack a structured digital platform
          to showcase their skills and connect with people who need their
          services.
        </p>
      </div>

      {/* Solution */}
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
          🤝
        </div>

        <h3 className="text-2xl font-bold text-[#12345b]">
          The Sahayog Solution
        </h3>

        <p className="mt-4 leading-7 text-[#526b86]">
          Sahayog brings workers and communities together through verified
          profiles, easier service discovery, fair opportunities, and a
          transparent service experience.
        </p>
      </div>

    </div>
  </div>
</section>

{/* Benefits */}
<section className="bg-[#f8fbfd] px-6 py-20 sm:py-24">
  <div className="mx-auto max-w-6xl">

    {/* Heading */}
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#16845f]">
        What Sahayog Enables
      </p>

      <h2 className="text-4xl font-bold tracking-tight text-[#12345b] sm:text-5xl">
        Built for people.
        <span className="block text-[#16845f]">
          Designed for communities.
        </span>
      </h2>

      <p className="mt-5 text-lg leading-8 text-[#526b86]">
        Everything needed to create a trusted and transparent connection
        between skilled workers and the people who need their services.
      </p>
    </div>

    {/* Benefits Grid */}
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

      {/* Card 1 */}
      <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
          ✓
        </div>

        <h3 className="text-xl font-bold text-[#12345b]">
          Verified Workers
        </h3>

        <p className="mt-3 leading-7 text-[#526b86]">
          Discover skilled and verified cooperative workers with transparent
          profiles and skill information.
        </p>
      </div>

      {/* Card 2 */}
      <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
          📅
        </div>

        <h3 className="text-xl font-bold text-[#12345b]">
          Easy Booking
        </h3>

        <p className="mt-3 leading-7 text-[#526b86]">
          Find the right service, choose a suitable time, and request help
          through a simple booking experience.
        </p>
      </div>

      {/* Card 3 */}
      <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
          ₹
        </div>

        <h3 className="text-xl font-bold text-[#12345b]">
          Fair & Transparent
        </h3>

        <p className="mt-3 leading-7 text-[#526b86]">
          Promote fair opportunities, transparent pricing, digital payments,
          and reliable service experiences.
        </p>
      </div>

      {/* Card 4 */}
      <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
          🤝
        </div>

        <h3 className="text-xl font-bold text-[#12345b]">
          Worker Welfare
        </h3>

        <p className="mt-3 leading-7 text-[#526b86]">
          Support worker welfare through cooperative participation, ratings,
          benefits, and opportunities for sustainable work.
        </p>
      </div>

    </div>
  </div>
</section>


      {/* Team */}
<section
  id="team"
  className="bg-white px-6 py-20 sm:py-24"
>
  <div className="mx-auto max-w-6xl">

    {/* Heading */}
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#16845f]">
        Team-SixBits
      </p>

      <h2 className="text-4xl font-bold tracking-tight text-[#12345b] sm:text-5xl">
        The people behind
        <span className="block text-[#16845f]">
          Sahayog.
        </span>
      </h2>

      <p className="mt-5 text-lg leading-8 text-[#526b86]">
        A team working together to build a more connected and
        cooperative-driven service ecosystem.
      </p>
    </div>

    {/* Team Members */}
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

      {/* Suyash */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-800">
          SJ
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Suyash Jaiswal
        </h3>
      </div>

      {/* Rohit Rastogi */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-800">
          RR
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Rohit Rastogi
        </h3>
      </div>

      {/* Ratnadip */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-800">
          RS
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Ratnadip Shit
        </h3>
      </div>

      {/* Swati */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-800">
          SK
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Swati Kumari
        </h3>
      </div>

      {/* Rohit Chowdhury */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-2xl font-bold text-sky-800">
          RC
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Rohit Chowdhury
        </h3>
      </div>

      {/* Vivek */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-800">
          VK
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Vivek Kumar
        </h3>
      </div>

    </div>
  </div>
</section>


{/* CTA */}
<section
  id="get-started"
  className="bg-[#f8fbfd] px-6 py-20 sm:py-24"
>
  <div className="mx-auto max-w-5xl">
    <div className="overflow-hidden rounded-[2rem] bg-[#0f4036] px-8 py-14 text-center shadow-xl sm:px-12 sm:py-16">

      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
        Join the Movement
      </p>

      <h2 
      id="github"
       className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Let's build stronger communities together.
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-emerald-50/80">
        Explore the Sahayog project and discover how technology can create
        better opportunities for skilled cooperative workers.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">

        <a
          href="https://github.com/suyash-jaiswal-7/Sahayog"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
        >
          View on GitHub →
        </a>

      </div>
    </div>
  </div>
</section>

            {/* Footer */}
<footer className="border-t border-slate-200 bg-white px-6 py-10">
  <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">

    {/* Branding */}
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt="Sahayog Logo"
        className="h-10 w-10 object-contain"
      />

      <div>
        <p className="font-bold text-[#12345b]">
          Sahayog
        </p>
        <p className="text-sm text-slate-500">
          People • Skills • Stronger Communities
        </p>
      </div>
    </div>

    {/* Links */}
    <div className="flex items-center gap-6 text-sm font-medium text-[#526b86]">
      <a
        href="#home"
        className="transition hover:text-[#16845f]"
      >
        Home
      </a>

      <a
        href="#about"
        className="transition hover:text-[#16845f]"
      >
        About
      </a>

      <a
        href="#team"
        className="transition hover:text-[#16845f]"
      >
        Team
      </a>

      <a
        href="https://github.com/suyash-jaiswal-7/Sahayog"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-[#16845f]"
      >
        GitHub
      </a>
    </div>

  </div>

  {/* Copyright */}
  <div className="mx-auto mt-8 max-w-6xl border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
    © 2026 Sahayog · Built by SixBits
  </div>
</footer>

    </div>
  )
}


/* ================= TEAM MEMBER COMPONENT ================= */

function TeamMember({ initials, name }) {
  return (
    <div className="group flex flex-col items-center">

      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-2xl font-bold text-[#16845f] shadow-sm ring-1 ring-[#cfe4da] transition group-hover:-translate-y-2 group-hover:shadow-lg">
        {initials}
      </div>

      <h3 className="mt-4 font-semibold text-[#12345b]">
        {name}
      </h3>

    </div>
  )
}

export default App