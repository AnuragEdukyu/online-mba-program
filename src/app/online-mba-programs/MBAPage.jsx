"use client";

// ============================================================
// FILE: src/app/online-mba-programs/MBAPage.jsx
//
// PENDING INTEGRATIONS (wire these before going live):
//   1. Form modal   → import Form from "@/Component/Form/Form"
//                     render: {showForm && <Form onClose={() => setShowForm(false)} />}
//   2. Data APIs    → uncomment fetch calls inside useEffect (see Data Fetching section)
//   3. Lead API     → replace setTimeout in CounselingForm.onSubmit with real fetch
//   4. Thank-you    → create /thank-you page (router.push already wired)
//   5. Navbar       → replace TODO comment with <Navbar />
//   6. Footer       → replace TODO comment with <Footer />
// ============================================================

import Image        from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm }  from "react-hook-form";
import { z }        from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import RankAndAccr    from "@/Component/RankAndAccr";
import HiringPartners from "@/Component/HiringPartners";
import Spinner        from "@/Component/Spinner";

// ─────────────────────────────────────────────────────────────
// FORM VALIDATION SCHEMA
// Strategy: strict on email & phone (data quality matters for leads),
// everything else just "non-empty" to keep friction low.
// ─────────────────────────────────────────────────────────────
const formSchema = z.object({
  name:       z.string().min(1, "Name is required"),
  email:      z.string().email("Please enter a valid email address"),
  phone:      z.string()
               .min(1, "Phone number is required")
               .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  city:       z.string().min(1, "City is required"),
  course:     z.string().min(1, "Preferred course is required"),
  university: z.string().min(1, "Please select a university"),
});

// ─────────────────────────────────────────────────────────────
// STATIC CONTENT
// These arrays are hardcoded UI content — not expected to come from the DB.
// ─────────────────────────────────────────────────────────────

const HIGHLIGHTS = [
  { img: "/ph3.png", title: "Live & Recorded Lectures" },
  { img: "/ph4.png", title: "Easy Financing" },
  { img: "/ph1.png", title: "Study Anytime Anywhere" },
  { img: "/ph2.png", title: "Real World Projects" },
];

const JOB_ROLES = [
  {
    level: "Entry Level",
    roles: [
      "Management Trainee", "Business Analyst", "Marketing Associate",
      "Financial Analyst", "Operations Executive", "Human Resource Executive",
    ],
  },
  {
    level: "Mid Level",
    roles: [
      "Marketing Manager", "Human Resource Manager", "Project Manager",
      "Finance Manager", "Operations Manager", "Product Manager",
    ],
  },
  {
    level: "Advanced Level",
    roles: [
      "Director of Operations", "Chief Financial Officer (CFO)",
      "Senior Product Manager", "Chief Executive Officer (CEO)",
      "Head of Marketing", "Chief Human Resource Officer",
    ],
  },
];

// Used in the counseling form dropdown only.
// Universities shown in the slider section come from the API (see useEffect).
const FORM_UNIVERSITIES = [
  "Amity University",
  "DY Patil Vidyapeeth",
  "Jain University",
  "Lovely Professional University",
  "Manipal University Jaipur",
  "NIU",
  "NMIMS University",
  "Sharda University",
  "Shoolini University",
  "Sikkim Manipal",
  "VIT",
  "Vivekananda Global University",
];

const ACCREDITATION_DATA = {
  university_info: {
    accreditations: [
      { name: "AICTE", image: "/aicte.png" },
      { name: "NAAC",  image: "/naac.png"  },
      { name: "NBA",   image: "/NBA.png"   },
      { name: "NIRF",  image: "/nirf.png"  },
      { name: "WES",   image: "/wes.png"   },
    ],
  },
};

const HIRING_DATA = [
  { name: "Accenture",     image: "/accenture.png"     },
  { name: "Capgemini",     image: "/capgemini.png"     },
  { name: "Career360",     image: "/career360.png"     },
  { name: "Flipkart",      image: "/flipkart.png"      },
  { name: "HDFC",          image: "/hdfc2.png"         },
  { name: "HCL",           image: "/hcl.png"           },
  { name: "Hero",          image: "/hero.png"          },
  { name: "IBM",           image: "/ibm.png"           },
  { name: "Indigo",        image: "/indigo.png"        },
  { name: "McAfee",        image: "/mcafee.png"        },
  { name: "OYO",           image: "/oyo.png"           },
  { name: "Paytm",         image: "/paytm - Copy.png"  },
  { name: "ProKarma",      image: "/prokarama.png"     },
  { name: "Tech Mahindra", image: "/tech-mahindra.png" },
  { name: "Whirlpool",     image: "/whirlpool.png"     },
  { name: "Wipro",         image: "/wipro.png"         },
];

// Number of cards visible per slider page.
// Change these constants to adjust both sliders at once.
const CPPV = 4; // Colleges per page view
const UPPV = 4; // Universities per page view

// ─────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────

/** Renders a teal section title followed by a full-width divider. */
function SectionHeader({ title }) {
  return (
    <>
      <h2 className="text-[#004d4d] text-xl md:text-2xl font-bold mb-2">{title}</h2>
      <div className="h-px w-full bg-gray-300 mb-6" />
    </>
  );
}

/** Circular prev/next button used by both sliders. */
function SliderBtn({ onClick, disabled, label, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-9 h-9 rounded-full border border-gray-200 bg-white grid place-items-center text-lg
        transition-colors hover:bg-[#025E68] hover:text-white hover:border-[#025E68]
        disabled:opacity-30 disabled:cursor-default"
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────

/**
 * Full-width hero banner with overlay text and CTA.
 *
 * @param {Function} onEnquire - Opens the enquiry form modal.
 *   Replace console log in openForm() with:
 *   import Form from "@/Component/Form/Form"
 *   render: {showForm && <Form onClose={() => setShowForm(false)} />}
 */
function Hero({ onEnquire }) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "1440/650", maxHeight: 650 }}
    >
      <Image
        src="/heroimage.jpg"
        alt="Master of Business Administration Online MBA"
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Dark gradient overlay — left-heavy for text legibility */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(90deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.25) 55%,transparent 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute z-20 text-white max-w-sm"
        style={{ left: "clamp(20px,14.16%,204px)", top: "50%", transform: "translateY(-65%)" }}
      >
        <h1 className="text-4xl md:text-5xl font-bold leading-snug mb-3">
          Master Of Business<br />Administration (MBA)
        </h1>
        <p className="text-sm md:text-base opacity-90 tracking-wide mt-2">Duration — 2 Years</p>

        {/* Enquire CTA — triggers the form modal */}
        <button
          onClick={onEnquire}
          className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 bg-[#025E68] text-white
            text-sm font-semibold rounded-lg border border-white/30
            transition-all duration-200
            hover:bg-white hover:text-[#025E68] hover:border-[#025E68] hover:-translate-y-px"
        >
          Enquire
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2.5 7h9M7 2.5l4.5 4.5L7 11.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// OVERVIEW
// ─────────────────────────────────────────────────────────────

/**
 * Program overview text + paginated colleges logo slider.
 *
 * Slider data shape: [{ name: string, logo: string }]
 * Populated via API — see useEffect in MBAPage.
 */
function Overview({ colleges, collegeIdx, onPrev, onNext }) {
  // While API data loads, render placeholder skeleton cards
  const visible = colleges.length
    ? colleges.slice(collegeIdx, collegeIdx + CPPV)
    : [1, 2, 3, 4];

  return (
    <section className="py-16">
      <SectionHeader title="Overview" />
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 min-w-0">
          <p className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-5">
            Enhance Your Career With India&apos;s Premier Online MBA
          </p>
          <div className="text-sm text-gray-700 leading-relaxed max-w-[489px] space-y-4">
            <p>
              Our Master of Business Administration is a 2 year (4 semesters) program that will help
              you gain a comprehensive understanding of the business world and thrive in a global
              marketplace. Learn from industry experts, engage in real-world case studies, and put
              theory into practice through internships and projects.
            </p>
            <p>
              Join a dynamic group of students and create invaluable connections with your peers remotely.
            </p>
          </div>
        </div>
        <div
          className="w-full lg:w-[504px] lg:flex-shrink-0 rounded-2xl border border-gray-200 overflow-hidden relative"
          style={{ aspectRatio: "504/284" }}
        >
          <Image
            src="/overview-img.jpg"
            alt="Overview"
            fill
            sizes="(max-width:768px) 100vw,504px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Colleges logo slider */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-gray-900">Top MBA Colleges</span>
          <div className="flex gap-2">
            <SliderBtn onClick={onPrev} disabled={collegeIdx === 0} label="Previous colleges">
              ‹
            </SliderBtn>
            <SliderBtn
              onClick={onNext}
              disabled={!colleges.length || collegeIdx >= colleges.length - CPPV}
              label="Next colleges"
            >
              ›
            </SliderBtn>
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden" role="list">
          {visible.map((c, i) => (
            <div
              key={i}
              role="listitem"
              className="flex-1 border border-gray-200 rounded-2xl flex items-center
                justify-center p-4 bg-gray-50 relative min-h-[80px]"
            >
              {typeof c === "object" ? (
                <Image src={c.logo} alt={c.name} fill className="object-contain p-2" />
              ) : (
                // Placeholder shown while API data is loading
                <span className="text-gray-300 text-sm">College {c}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// HIGHLIGHTS
// ─────────────────────────────────────────────────────────────

/** Static program highlights grid. No API dependency. */
function Highlights() {
  return (
    <section className="pb-16">
      <SectionHeader title="Program Highlights & Advantages" />
      <p className="text-sm text-gray-500 mb-8">
        Discover our online MBA degree program and begin an exciting educational journey
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {HIGHLIGHTS.map((h) => (
          <div key={h.img} className="flex flex-col items-center gap-4 text-center">
            <div className="w-full aspect-square rounded-2xl overflow-hidden relative bg-[#eef2f7]">
              <Image
                src={h.img}
                alt={h.title}
                fill
                sizes="(max-width:480px) 100vw,(max-width:768px) 50vw,25vw"
                className="object-cover"
              />
            </div>
            <p className="text-base md:text-lg font-bold leading-snug max-w-[150px]">{h.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// SPECIALIZATIONS
// ─────────────────────────────────────────────────────────────

/**
 * MBA specialization cards fetched from the DB.
 * Renders a placeholder until data arrives.
 * Replace the inner div with your <BlogCard /> or <SpecializationCard /> component.
 */
function Specializations({ mbaBlogs }) {
  return (
    <section className="pb-16">
      <SectionHeader title="Program Related Specializations" />
      <span className="inline-block px-4 py-1.5 border border-[#025E68] rounded-full text-[#025E68] text-sm mb-6">
        Online MBA
      </span>
      {mbaBlogs.length === 0 ? (
        <div className="min-h-[200px] border border-dashed border-gray-200 rounded-2xl
          flex items-center justify-center text-sm text-gray-400">
          Specializations will populate here once the API is connected
        </div>
      ) : (
        <div className="space-y-4">
          {mbaBlogs.map((b, i) => (
            // TODO: replace with <SpecializationCard blog={b} />
            <div key={i} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ACCREDITATIONS
// ─────────────────────────────────────────────────────────────

/**
 * Accreditation logos marquee inside a teal card.
 *
 * RankAndAccr renders its own <h2> with color text-[#024B53], which is
 * invisible on this teal background. We suppress it with [&_h2]:hidden
 * and render our own white title above the marquee.
 */
function Accreditations() {
  return (
    <section className="pb-16">
      <div className="bg-[#025E68] rounded-2xl py-10 px-8 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-white text-3xl md:text-4xl font-semibold font-[Outfit] leading-snug">
            Our Accreditations &amp; Recognitions
          </h2>
          <p className="text-white/75 text-sm mt-2">
            Endorsements of Excellence, Recognitions and Accreditations Celebrating Academic Quality
          </p>
        </div>
        <div className="[&_h2]:hidden">
          <RankAndAccr college={ACCREDITATION_DATA} />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ELIGIBILITY
// ─────────────────────────────────────────────────────────────

/** Static eligibility criteria. No API dependency. */
function Eligibility() {
  return (
    <section className="pb-16">
      <SectionHeader title="Eligibility" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div>
          <h3 className="text-lg font-bold mb-4">Who Should Apply?</h3>
          <ul className="space-y-3">
            {[
              "Fresh graduates, final year students or working professionals.",
              "Entrepreneurs looking to develop skills to manage critical business projects.",
              "Aspirants seeking a global career in Management, Finance, Marketing, Sales, Operations and more.",
            ].map((item) => (
              <li key={item} className="text-sm text-gray-600 leading-relaxed pl-5 relative">
                <span className="absolute left-0 text-[#025E68] font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {["National", "International"].map((type) => (
          <div key={type} className="border border-gray-200 rounded-2xl p-6">
            <h4 className="text-base font-bold text-[#025E68] mb-3">{type}</h4>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              Graduation in any discipline with 40% marks in the last qualifying examination.
              Below 40%, a test is conducted and if passed the student is eligible.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Applicants must possess sufficient knowledge of the English Language.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMISSION PROCESS
// ─────────────────────────────────────────────────────────────

/**
 * Admission process infographic + counseling CTA.
 *
 * @param {Function} onEnquire - Opens the enquiry form modal.
 */
function AdmissionProcess({ onEnquire }) {
  return (
    <section className="pb-16">
      <SectionHeader title="Admission Process" />
      <div
        className="w-full rounded-2xl overflow-hidden relative bg-[#eef2f7] my-8"
        style={{ aspectRatio: "1032/330" }}
      >
        <Image
          src="/admission-process.jpg"
          alt="MBA Admission Process"
          fill
          sizes="(max-width:768px) 100vw,1032px"
          className="object-cover"
        />
      </div>
      <div className="block w-fit mx-auto">
        <button
          onClick={onEnquire}
          className="px-7 py-2.5 bg-[#025E68] text-white text-sm font-semibold rounded-lg
            border border-[#025E68] transition-all hover:bg-[#037a87] hover:-translate-y-px"
        >
          Book a Free Counseling Session
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// JOB ROLES
// ─────────────────────────────────────────────────────────────

/** Static three-tier job roles grid. No API dependency. */
function JobRoles() {
  return (
    <section className="pb-16">
      <SectionHeader title="Job Roles" />
      <p className="text-sm text-gray-500 mb-8">
        Online MBA unlocks lucrative careers in various fields.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {JOB_ROLES.map(({ level, roles }) => (
          <div key={level} className="border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-center mb-6">
              <span className="px-4 py-1.5 bg-[#025E68] text-white text-xs font-bold
                uppercase tracking-widest rounded-full">
                {level}
              </span>
            </div>
            <ul className="divide-y divide-gray-100">
              {roles.map((r) => (
                <li key={r} className="flex items-center gap-3 py-3 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#025E68] flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// UNIVERSITIES
// ─────────────────────────────────────────────────────────────

/**
 * Paginated universities card slider.
 *
 * Slider data shape: [{ name: string, logo: string }]
 * Populated via API — see useEffect in MBAPage.
 * Replace the inner placeholder div with your <UniversityCard /> component.
 */
function Universities({ universities, uniIdx, onPrev, onNext }) {
  // While API data loads, render placeholder skeleton cards
  const visible = universities.length
    ? universities.slice(uniIdx, uniIdx + UPPV)
    : [1, 2, 3, 4];

  return (
    <section className="pb-16">
      <div className="flex items-start justify-between gap-4 mb-6">
        <SectionHeader title="Choose Your Universities Wisely!" />
        <div className="flex gap-2 flex-shrink-0 mt-1">
          <SliderBtn onClick={onPrev} disabled={uniIdx === 0} label="Previous universities">
            ‹
          </SliderBtn>
          <SliderBtn
            onClick={onNext}
            disabled={!universities.length || uniIdx >= universities.length - UPPV}
            label="Next universities"
          >
            ›
          </SliderBtn>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list">
        {visible.map((u, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-2xl overflow-hidden relative bg-gray-50"
            style={{ aspectRatio: "240/444" }}
            role="listitem"
          >
            {/* TODO: replace with <UniversityCard university={u} /> */}
            {typeof u === "object" && null}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// HIRING PARTNERS
// ─────────────────────────────────────────────────────────────

/** Auto-scrolling hiring partners marquee. Data is static (HIRING_DATA). */
function HiringPartnersSection() {
  return (
    <section className="pb-16">
      <HiringPartners partners={HIRING_DATA} speed={80} title="Hiring Partners" />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FORM ERROR SUMMARY
// ─────────────────────────────────────────────────────────────

/**
 * Renders all react-hook-form validation errors in a single block
 * above the submit button, rather than inline per field.
 * Fields still get a red border via aria-invalid; this component
 * provides the human-readable list.
 */
function FormErrorSummary({ errors }) {
  const messages = Object.values(errors)
    .map((e) => e?.message)
    .filter(Boolean);

  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <p className="font-semibold mb-1">Please fix the following:</p>
      <ul className="list-disc list-inside space-y-0.5">
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COUNSELING FORM
// ─────────────────────────────────────────────────────────────

/**
 * Lead capture form rendered in a full-width section below the main content.
 *
 * Validation : react-hook-form + zod (see formSchema above)
 * Errors     : centralised via FormErrorSummary
 * Submission : replace the setTimeout stub with your real API call
 * Redirect   : router.push("/thank-you") — create that page before going live
 */
function CounselingForm() {
  const router                = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",           // validate on submit only — reduces noise while typing
    reValidateMode: "onChange", // re-validate touched fields after first submit attempt
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // ── TODO: replace with real lead submission ────────────────
      // Example:
      // await fetch("/api/leads", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });
      await new Promise((res) => setTimeout(res, 1500)); // temporary network simulation
      // ──────────────────────────────────────────────────────────

      console.log("Lead saved:", data);
      router.push("/thank-you"); // TODO: create /thank-you page
    } catch (err) {
      console.error("Lead submission failed:", err);
      // TODO: show a user-facing error toast/banner here
    } finally {
      setLoading(false);
    }
  };

  return (
    // id="counseling-form" allows the hero Enquire button to anchor-scroll here
    <section id="counseling-form" className="py-16 bg-[#f8fbfc]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-[204px]">
        <h2 className="text-lg md:text-2xl font-bold max-w-[909px] mb-10 text-gray-900">
          Speak to our Admission Counselor to know more about our Programs / Universities.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <input
            {...register("name")}
            type="text"
            placeholder="Your Name"
            aria-label="Your Name"
            aria-invalid={!!errors.name}
            className={`w-full h-10 border rounded-2xl px-4 text-sm text-gray-900 bg-white
              outline-none transition-colors
              ${errors.name
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#025E68]"}`}
          />
          <input
            {...register("email")}
            type="text"
            placeholder="Email Address"
            aria-label="Email Address"
            aria-invalid={!!errors.email}
            className={`w-full h-10 border rounded-2xl px-4 text-sm text-gray-900 bg-white
              outline-none transition-colors
              ${errors.email
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#025E68]"}`}
          />
          <input
            {...register("phone")}
            type="text"
            placeholder="Phone Number"
            aria-label="Phone Number"
            aria-invalid={!!errors.phone}
            className={`w-full h-10 border rounded-2xl px-4 text-sm text-gray-900 bg-white
              outline-none transition-colors
              ${errors.phone
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#025E68]"}`}
          />
          <input
            {...register("city")}
            type="text"
            placeholder="City"
            aria-label="City"
            aria-invalid={!!errors.city}
            className={`w-full h-10 border rounded-2xl px-4 text-sm text-gray-900 bg-white
              outline-none transition-colors
              ${errors.city
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#025E68]"}`}
          />
          <input
            {...register("course")}
            type="text"
            placeholder="Preferred Course"
            aria-label="Preferred Course"
            aria-invalid={!!errors.course}
            className={`w-full h-10 border rounded-2xl px-4 text-sm text-gray-900 bg-white
              outline-none transition-colors
              ${errors.course
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#025E68]"}`}
          />
          <div className="relative w-full">
            <select
              {...register("university")}
              aria-label="Preferred University"
              aria-invalid={!!errors.university}
              defaultValue=""
              className={`w-full h-10 border rounded-2xl px-4 pr-10 text-sm bg-white
                outline-none transition-colors appearance-none cursor-pointer
                ${errors.university
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-[#025E68]"}`}
            >
              <option value="" disabled>Preferred University</option>
              {FORM_UNIVERSITIES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1L6 7L11 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <FormErrorSummary errors={errors} />

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="h-[50px] px-10 bg-[#025E68] text-white text-sm font-semibold rounded-2xl
            border border-[#025E68] transition-all hover:bg-[#037a87] hover:-translate-y-px
            disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
            flex items-center gap-2 w-full md:w-auto"
        >
          {loading ? (
            <>
              <Spinner />
              <span>Submitting…</span>
            </>
          ) : (
            "Find Best University"
          )}
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE ROOT
// ─────────────────────────────────────────────────────────────

export default function MBAPage() {

  // ── Form modal state ────────────────────────────────────────
  // Wire up before going live:
  //   1. import Form from "@/Component/Form/Form"
  //   2. Add {showForm && <Form onClose={() => setShowForm(false)} />} to the return
  const [showForm, setShowForm] = useState(false);

  const openForm = () => {
    // TODO: remove console.log and uncomment Form render in return
    console.log("openForm() triggered — wire <Form /> component here");
    setShowForm(true);
  };

  // ── Slider state ────────────────────────────────────────────
  // All four arrays below are populated by the useEffect fetch calls.
  // They intentionally start empty so the page renders immediately
  // without blocking on the network — skeleton cards appear while data loads.
  const [colleges,     setColleges]     = useState([]);
  const [collegeIdx,   setCollegeIdx]   = useState(0);
  const [universities, setUniversities] = useState([]);
  const [uniIdx,       setUniIdx]       = useState(0);
  const [mbaBlogs,     setMbaBlogs]     = useState([]);

  // ── Data fetching ───────────────────────────────────────────
  // Fires once after the component mounts (empty dependency array).
  // Each setter directly maps to the state variables above — no
  // transformation needed as long as the API returns the correct shape:
  //   universities / colleges → Array<{ name: string, logo: string }>
  //   mbaBlogs               → Array<{ ...your blog fields }>
  //
  // If the API is not ready yet, skip the fetch and seed the state directly:
  //   useState([{ name: "Amity University", logo: "/amity.png" }, ...])
  // Revert to useState([]) and uncomment the fetch once the endpoint is live.
  //
  useEffect(() => {

    // Universities slider
    // fetch("/api/universities")
    //   .then((r) => r.json())
    //   .then((data) => setUniversities(data))
    //   .catch((err) => console.error("Universities fetch failed:", err));

    // Colleges slider
    // fetch("/api/colleges")
    //   .then((r) => r.json())
    //   .then((data) => setColleges(data))
    //   .catch((err) => console.error("Colleges fetch failed:", err));

    // MBA specializations / blogs
    // fetch("/api/mba-blogs")
    //   .then((r) => r.json())
    //   .then((data) => setMbaBlogs(data))
    //   .catch((err) => console.error("MBA blogs fetch failed:", err));

  }, []);

  return (
    <>
      {/* TODO: <Navbar /> */}

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-[204px]">

        <Hero onEnquire={openForm} />

        <Overview
          colleges={colleges}
          collegeIdx={collegeIdx}
          onPrev={() => setCollegeIdx((p) => Math.max(0, p - CPPV))}
          onNext={() => setCollegeIdx((p) => Math.min(colleges.length - CPPV, p + CPPV))}
        />

        <Highlights />
        <Specializations mbaBlogs={mbaBlogs} />
        <Accreditations />
        <Eligibility />

        <AdmissionProcess onEnquire={openForm} />

        <JobRoles />

        <Universities
          universities={universities}
          uniIdx={uniIdx}
          onPrev={() => setUniIdx((p) => Math.max(0, p - UPPV))}
          onNext={() => setUniIdx((p) => Math.min(universities.length - UPPV, p + UPPV))}
        />

        <HiringPartnersSection />
      </main>

      {/*
        CounselingForm sits outside <main> intentionally.
        Its background color (bg-[#f8fbfc]) must span the full viewport width,
        which would be clipped by main's max-width and horizontal padding.
      */}
      <CounselingForm />

      {/* TODO: <Footer /> */}
    </>
  );
}