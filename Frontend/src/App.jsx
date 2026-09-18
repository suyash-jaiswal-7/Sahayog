import electricianImg from "./assets/workers/electrician.png";
import plumberImg from "./assets/workers/plumber.png";
import sanitationImg from "./assets/workers/sanitation.png";
import logo from './assets/logo.png'
import suyashImg from "./assets/team/suyash.jpg";
import rohitRastogiImg from "./assets/team/rohit_rastogi.jpg";
import ratnadipImg from "./assets/team/ratnadip.jpg";
import swatiImg from "./assets/team/swati.jpg";
import rohitChowdhuryImg from "./assets/team/rohit_chowdhury.jpg";
import vivekImg from "./assets/team/vivek.jpg";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, CalendarCheck, IndianRupee, Handshake, Languages } from "lucide-react";
import AuthPage from "./pages/AuthPage";

// AuthPage contains frontend-only authentication UI for now.
// Backend teammates can later connect its forms to the relevant
// Customer, Worker, and Cooperative Owner authentication endpoints.
function App() {
  const [showAuth, setShowAuth] = useState(
  window.location.hash === "#auth"
);
  const [language, setLanguage] = useState("en");
  const isHindi = language === "hi";
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
    role: isHindi ? "इलेक्ट्रीशियन" : "Electrician",
    description: isHindi ? "विद्युत सेवाएँ" : "Electrical services",
    image: electricianImg,
  },
  {
    role: isHindi ? "प्लंबर" : "Plumber",
    description: isHindi ? "प्लंबिंग सेवाएँ" : "Plumbing services",
    image: plumberImg,
  },
  {
    role: isHindi ? "स्वच्छता कर्मी" : "Sanitation Worker",
    description: isHindi ? "सफाई और स्वच्छता सेवाएँ" : "Cleaning & sanitation",
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:py-5">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
            src={logo}
            alt="Sahayog Logo"
            className="h-24 w-24 object-contain"/>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#12345b]">
                Sahayog
              </h1>
              <p className="text-sm text-gray-500">
                {isHindi ? "लोग • कौशल • मजबूत समुदाय" : "People • Skills • Stronger Communities"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden items-center gap-8 lg:flex lg:-translate-x-8">
            <a href="#home" className="text-base font-medium text-[#16845f]">
              {isHindi ? "होम" : "Home"}
            </a>

            <a
              href="#about"
              className="text-base font-medium text-gray-700 transition hover:text-[#16845f]"
            >
              {isHindi ? "हमारे बारे में" : "About"}
            </a>

            <a
              href="#team"
              className="text-base font-medium text-gray-700 transition hover:text-[#16845f]"
            >
              {isHindi ? "हमारी टीम" : "Our Team"}
            </a>

            <a
              href="#github"
              className="text-base font-medium text-gray-700 transition hover:text-[#16845f]"
            >
              GitHub
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-3 lg:min-w-[360px] lg:justify-end">
            <button
              type="button"
              onClick={() => setLanguage(isHindi ? "en" : "hi")}
              className="inline-flex items-center gap-2 rounded-full border border-[#d4e0e8] bg-white px-4 py-2.5 text-sm font-semibold text-[#12345b] shadow-sm transition hover:border-[#16845f] hover:text-[#16845f]"
              aria-label={isHindi ? "Switch to English" : "Switch to Hindi"}
            >
              <Languages size={18} strokeWidth={1.8} />
              <span>{isHindi ? "EN" : "हिंदी"}</span>
            </button>

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
            {isHindi ? "शुरू करें" : "Get Started"}
          </button>

            {/* Reserved space for future Admin Login */}
            <div className="hidden w-28 lg:block" aria-hidden="true" />
          </div>
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
        {isHindi ? "सहकारी संस्था की पहल" : "A Cooperative-Owned Initiative"}
      </div>

      {/* Heading */}
      <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-[#12345b] sm:text-6xl lg:text-[4.3rem]">
        {isHindi ? "कौशल को सशक्त बनाना।" : "Empowering Skills."}
        <span className="block text-[#16845f]">
          {isHindi ? "समुदायों को जोड़ना।" : "Connecting Communities."}
        </span>
      </h1>

      {/* Description */}
      <p className="mt-6 max-w-xl text-lg leading-8 text-[#526b86]">
        {isHindi
          ? "सहयोग कुशल सहकारी श्रमिकों को परिवारों और समुदायों से जोड़ता है, जिससे भरोसेमंद अवसर, उचित काम और मजबूत स्थानीय संबंध बनते हैं।"
          : "Sahayog connects skilled cooperative workers with households and communities, creating trusted opportunities, fair work, and stronger local connections."}
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">

        <button
          onClick={() => setShowAuth(true)}
          className="inline-flex items-center justify-center rounded-xl bg-[#e67e22] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#16845f]/20 transition hover:-translate-y-0.5 hover:bg-[#11704f]"
        >
          {isHindi ? "शुरू करें" : "Get Started"}
        </button>

        <a
          href="#about"
          className="inline-flex items-center justify-center rounded-xl border border-[#d4e0e8] bg-white px-7 py-3.5 font-semibold text-[#12345b] shadow-sm transition hover:-translate-y-0.5 hover:border-[#16845f] hover:text-[#16845f]"
        >
          {isHindi ? "और जानें" : "Learn More"}
        </a>

      </div>

      {/* Trust indicators */}
      <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#526b86]">

        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f5ec] text-xs font-bold text-[#16845f]">
            <ShieldCheck size={26} strokeWidth={1.8} />
          </span>
          {isHindi ? "सत्यापित श्रमिक" : "Verified Workers"}
        </span>

        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f5ec] text-xs font-bold text-[#16845f]">
            <ShieldCheck size={26} strokeWidth={1.8} />
          </span>
          {isHindi ? "उचित अवसर" : "Fair Opportunities"}
        </span>

        <span className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f5ec] text-xs font-bold text-[#16845f]">
            <ShieldCheck size={26} strokeWidth={1.8} />
          </span>
          {isHindi ? "समुदाय पहले" : "Community First"}
        </span>

      </div>
    </div>


    {/* ================= RIGHT VISUAL ================= */}
    <div className="relative mx-auto w-full max-w-xl">

      {/* Decorative circles */}
      <div className="absolute -left-6 top-10 h-20 w-20 rounded-full bg-[#e67e22]/10" />
      <div className="absolute -right-5 bottom-16 h-28 w-28 rounded-full bg-[#12345b]/10" />

      {/* Medium worker card */}
      <div className="relative mx-auto flex h-[470px] w-full max-w-[380px] items-center justify-center sm:h-[500px] sm:max-w-[400px]">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWorker.role}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.97 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative flex h-[450px] w-[330px] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-[0_24px_70px_rgba(18,52,91,0.18)] sm:h-[480px] sm:w-[350px]"
          >

            <div className="min-h-0 flex-1 overflow-hidden bg-[#f7faf9] px-3 pt-3">
              <img
                src={currentWorker.image}
                alt={currentWorker.role}
                className="h-full w-full object-contain object-bottom"
              />
            </div>

            <div className="border-t border-slate-100 bg-white px-6 py-4">
              <p className="text-lg font-bold text-[#12345b]">
                {currentWorker.role}
              </p>
              <p className="mt-1 text-sm text-[#647b94]">
                {currentWorker.description}
              </p>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Worker indicator */}
        <div className="absolute -bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-lg">
          {workers.map((worker, index) => (
            <span
              key={worker.role}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === workerIndex
                  ? "w-6 bg-[#16845f]"
                  : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Floating card — worker */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card absolute -left-4 top-20 z-30 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md sm:-left-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f5ec] text-[#16845f]">
              <span className="text-lg">✓</span>
            </div>
            <div>
              <p className="text-xs text-[#7a8da3]">{isHindi ? "भरोसेमंद" : "Trusted"}</p>
              <p className="text-sm font-bold text-[#12345b]">{isHindi ? "कुशल श्रमिक" : "Skilled Workers"}</p>
            </div>
          </div>
        </motion.div>

        {/* Floating card — community */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="glass-card absolute -right-3 bottom-20 z-30 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md sm:-right-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f0fb] text-[#2e6fb0]">
              <span className="text-lg">●</span>
            </div>
            <div>
              <p className="text-xs text-[#7a8da3]">{isHindi ? "बना है" : "Built for"}</p>
              <p className="text-sm font-bold text-[#12345b]">{isHindi ? "समुदायों के लिए" : "Communities"}</p>
            </div>
          </div>
        </motion.div>

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
        {isHindi ? "सहयोग के बारे में" : "About Sahayog"}
      </p>

      <h2 className="text-4xl font-bold tracking-tight text-[#12345b] sm:text-5xl">
        {isHindi ? "कौशल को अवसर मिलना चाहिए।" : "Skills deserve opportunity."}
        <span className="block text-[#16845f]">
          {isHindi ? "समुदाय भरोसे के हकदार हैं।" : "Communities deserve trust."}
        </span>
      </h2>

      <p className="mt-6 text-lg leading-8 text-[#526b86]">
        {isHindi
          ? "सहयोग एक सहकारी संस्था के स्वामित्व वाला डिजिटल प्लेटफ़ॉर्म है, जो कुशल श्रमिकों को परिवारों और संस्थानों से भरोसेमंद, पारदर्शी और समुदाय-केंद्रित तरीके से जोड़ता है।"
          : "Sahayog is a cooperative-owned digital platform designed to connect skilled workers with households and institutions in a trusted, transparent, and community-driven way."}
      </p>
    </div>

    {/* Problem → Solution */}
    <div className="mt-14 grid gap-6 md:grid-cols-2">

      {/* Problem */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10">
        <h3 className="text-center text-3xl font-bold tracking-tight text-[#12345b]">
          {isHindi ? "चुनौती" : "The Challenge"}
        </h3>

        <p className="mt-6 text-center text-lg leading-8 text-[#526b86]">
          {isHindi
            ? "कुशल सहकारी श्रमिकों के पास अक्सर ऐसा व्यवस्थित डिजिटल प्लेटफ़ॉर्म नहीं होता जहाँ वे अपने कौशल दिखा सकें, अधिक ग्राहकों तक पहुँच सकें और सीधे जरूरतमंद लोगों से जुड़ सकें। डिजिटल उपस्थिति की कमी से अवसर छूटते हैं और उनके मूल्यवान कौशल को पर्याप्त पहचान नहीं मिल पाती।"
            : "Skilled cooperative workers often lack a structured digital platform to showcase their skills, reach more customers, and connect directly with people who need their services. Without an accessible digital presence, many capable workers face missed opportunities, underemployment, and limited recognition for the valuable skills they bring to their communities."}
        </p>
      </div>

      {/* Solution */}
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-10">
        <h3 className="text-center text-3xl font-bold tracking-tight text-[#12345b]">
          {isHindi ? "सहयोग का समाधान" : "The Sahayog Solution"}
        </h3>

        <p className="mt-6 text-center text-lg leading-8 text-[#526b86]">
          {isHindi
            ? "सहयोग सत्यापित प्रोफ़ाइल, आसान सेवा खोज, उचित अवसर और पारदर्शी सेवा अनुभव के माध्यम से श्रमिकों और समुदायों को जोड़ता है। तकनीक के जरिए सहकारी मूल्यों को मजबूत करते हुए, यह स्थानीय प्रतिभा को अधिक पहचान दिलाता है और परिवारों व संस्थानों के लिए भरोसेमंद कुशल श्रमिकों से जुड़ना आसान बनाता है।"
            : "Sahayog brings workers and communities together through verified profiles, easier service discovery, fair opportunities, and a transparent service experience. By using technology to strengthen cooperative values, the platform helps local talent become more visible while making it easier for households and institutions to discover and connect with trusted skilled workers."}
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
        {isHindi ? "सहयोग क्या संभव बनाता है" : "What Sahayog Enables"}
      </p>

      <h2 className="text-4xl font-bold tracking-tight text-[#12345b] sm:text-5xl">
        {isHindi ? "लोगों के लिए बनाया गया।" : "Built for people."}
        <span className="block text-[#16845f]">
          {isHindi ? "समुदायों के लिए डिज़ाइन किया गया।" : "Designed for communities."}
        </span>
      </h2>

      <p className="mt-5 text-lg leading-8 text-[#526b86]">
        {isHindi
          ? "कुशल श्रमिकों और उनकी सेवाओं की जरूरत रखने वाले लोगों के बीच भरोसेमंद और पारदर्शी जुड़ाव के लिए आवश्यक सुविधाएँ।"
          : "Everything needed to create a trusted and transparent connection between skilled workers and the people who need their services."}
      </p>
    </div>

    {/* Benefits Grid */}
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

      {/* Card 1 */}
      <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
          <ShieldCheck size={26} strokeWidth={1.8} />
        </div>

        <h3 className="text-xl font-bold text-[#12345b]">
          {isHindi ? "सत्यापित श्रमिक" : "Verified Workers"}
        </h3>

        <p className="mt-3 leading-7 text-[#526b86]">
                    {isHindi ? "पारदर्शी प्रोफ़ाइल और कौशल जानकारी के साथ सत्यापित सहकारी श्रमिकों को खोजें।" : "Discover skilled and verified cooperative workers with transparent           profiles and skill information."}
        </p>
      </div>

      {/* Card 2 */}
      <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
          <CalendarCheck size={26} strokeWidth={1.8} />
        </div>

        <h3 className="text-xl font-bold text-[#12345b]">
          {isHindi ? "आसान बुकिंग" : "Easy Booking"}
        </h3>

        <p className="mt-3 leading-7 text-[#526b86]">
                    {isHindi ? "सही सेवा खोजें, उपयुक्त समय चुनें और सरल बुकिंग अनुभव के जरिए सहायता का अनुरोध करें।" : "Find the right service, choose a suitable time, and request help           through a simple booking experience."}
        </p>
      </div>

      {/* Card 3 */}
      <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
          <IndianRupee size={26} strokeWidth={1.8} />
        </div>

        <h3 className="text-xl font-bold text-[#12345b]">
          {isHindi ? "उचित और पारदर्शी" : "Fair & Transparent"}
        </h3>

        <p className="mt-3 leading-7 text-[#526b86]">
                    {isHindi ? "उचित अवसर, पारदर्शी मूल्य निर्धारण, डिजिटल भुगतान और भरोसेमंद सेवा अनुभव को बढ़ावा दें।" : "Promote fair opportunities, transparent pricing, digital payments,           and reliable service experiences."}
        </p>
      </div>

      {/* Card 4 */}
      <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
          <Handshake size={26} strokeWidth={1.8} />
        </div>

        <h3 className="text-xl font-bold text-[#12345b]">
          {isHindi ? "श्रमिक कल्याण" : "Worker Welfare"}
        </h3>

        <p className="mt-3 leading-7 text-[#526b86]">
                    {isHindi ? "सहकारी भागीदारी, रेटिंग, लाभ और टिकाऊ काम के अवसरों के माध्यम से श्रमिक कल्याण का समर्थन करें।" : "Support worker welfare through cooperative participation, ratings,           benefits, and opportunities for sustainable work."}
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
        {isHindi ? "टीम-सिक्सबिट्स" : "Team-SixBits"}
      </p>

      <h2 className="text-4xl font-bold tracking-tight text-[#12345b] sm:text-5xl">
        {isHindi ? "इसके पीछे के लोग" : "The people behind"}
        <span className="block text-[#16845f]">
          {isHindi ? "सहयोग।" : "Sahayog."}
        </span>
      </h2>

      <p className="mt-5 text-lg leading-8 text-[#526b86]">
        {isHindi
          ? "एक अधिक जुड़ा हुआ और सहकारी सेवा तंत्र बनाने के लिए साथ काम करती टीम।"
          : "A team working together to build a more connected and cooperative-driven service ecosystem."}
      </p>
    </div>

    {/* Team Members */}
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

      {/* Suyash */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-emerald-100 shadow-sm">
          <img src={suyashImg} alt="Suyash Jaiswal" className="h-full w-full object-cover" />
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Suyash Jaiswal
        </h3>
      </div>

      {/* Rohit Rastogi */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-blue-100 shadow-sm">
          <img src={rohitRastogiImg} alt="Rohit Rastogi" className="h-full w-full object-cover" />
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Rohit Rastogi
        </h3>
      </div>

      {/* Ratnadip */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-orange-100 shadow-sm">
          <img src={ratnadipImg} alt="Ratnadip Shit" className="h-full w-full object-cover" />
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Ratnadip Shit
        </h3>
      </div>

      {/* Swati */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-purple-100 shadow-sm">
          <img src={swatiImg} alt="Swati Kumari" className="h-full w-full object-cover object-[50%_35%]" />
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Swati Kumari
        </h3>
      </div>

      {/* Rohit Chowdhury */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-sky-100 shadow-sm">
          <img src={rohitChowdhuryImg} alt="Rohit Chowdhury" className="h-full w-full object-cover" />
        </div>

        <h3 className="mt-5 text-xl font-bold text-[#12345b]">
          Rohit Chowdhury
        </h3>
      </div>

      {/* Vivek */}
      <div className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg">
        <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-teal-100 shadow-sm">
          <img src={vivekImg} alt="Vivek Kumar" className="h-full w-full object-cover" />
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
        {isHindi ? "आंदोलन से जुड़ें" : "Join the Movement"}
      </p>

      <h2 
      id="github"
       className="mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {isHindi ? "आइए मिलकर मजबूत समुदाय बनाएं।" : "Let's build stronger communities together."}
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-emerald-50/80">
        {isHindi
          ? "सहयोग प्रोजेक्ट देखें और जानें कि तकनीक कुशल सहकारी श्रमिकों के लिए बेहतर अवसर कैसे बना सकती है।"
          : "Explore the Sahayog project and discover how technology can create better opportunities for skilled cooperative workers."}
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">

        <a
          href="https://github.com/suyash-jaiswal-7/Sahayog"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
        >
          {isHindi ? "GitHub पर देखें →" : "View on GitHub →"}
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
          {isHindi ? "लोग • कौशल • मजबूत समुदाय" : "People • Skills • Stronger Communities"}
        </p>
      </div>
    </div>

    {/* Links */}
    <div className="flex items-center gap-6 text-sm font-medium text-[#526b86]">
      <a
        href="#home"
        className="transition hover:text-[#16845f]"
      >
        {isHindi ? "होम" : "Home"}
      </a>

      <a
        href="#about"
        className="transition hover:text-[#16845f]"
      >
        {isHindi ? "हमारे बारे में" : "About"}
      </a>

      <a
        href="#team"
        className="transition hover:text-[#16845f]"
      >
        {isHindi ? "टीम" : "Team"}
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
    © 2026 Sahayog · {isHindi ? "SixBits द्वारा निर्मित" : "Built by SixBits"}
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