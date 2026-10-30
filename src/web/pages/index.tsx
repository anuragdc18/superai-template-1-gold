import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Headphones,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Upload,
  Users,
} from "lucide-react";
import { CATEGORIES, POPULAR, SLIDES, serviceUrl, waLink } from "../lib/site";
import { telHref, useSite } from "../queries/site";
import { LeadForm } from "../components/lead-form";
import { useContent } from "../queries/content";
import { PostCard } from "../components/content-ui";

/* ───────────────────────── Hero ───────────────────────── */

function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = SLIDES.length;
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((v) => (v + 1) % n), 5000);
    return () => clearTimeout(t);
  }, [i, paused, n]);
  const s = SLIDES[i];
  const others = SLIDES.map((x, idx) => ({ ...x, idx })).filter((x) => x.idx !== i);

  return (
    <section
      className="relative isolate overflow-hidden bg-navy"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {SLIDES.map((x, idx) => (
        <img
          key={x.image}
          src={x.image}
          alt=""
          aria-hidden
          className={`absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center] transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-[rgba(14,13,11,0.62)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-navy/80 to-transparent" />

      <div key={i} className="container-x flex min-h-[620px] flex-col items-center pb-24 pt-20 text-center sm:min-h-[685px] sm:pt-[98px]">
        <p className="rise text-[13px] font-bold uppercase tracking-[0.42em] text-brand sm:text-[14px]">{s.tag}</p>
        <span className="rise mt-6 block h-px w-24 bg-brand" />
        <h1 className="rise mt-8 max-w-[860px] text-[40px] font-bold leading-[1.08] !text-white sm:text-[58px] lg:text-[75px]" style={{ animationDelay: "80ms" }}>
          {s.title}
        </h1>
        <p className="rise mt-6 max-w-[600px] text-[17px] leading-relaxed text-[#d9d2c3] sm:text-[19px]" style={{ animationDelay: "160ms" }}>
          {s.text}
        </p>
        <div className="rise mt-10 flex flex-wrap justify-center gap-4" style={{ animationDelay: "240ms" }}>
          {s.cta ? (
            <>
              <a href="#enquiry" className="btn-brand">
                {s.cta} <ArrowRight className="h-4 w-4" />
              </a>
              <Link to={s.link} className="btn-outline-gold">
                {s.linkText}
              </Link>
            </>
          ) : (
            <Link to={s.link} className="btn-brand">
              {s.linkText} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="mt-auto hidden flex-wrap justify-center gap-x-10 gap-y-3 pt-16 sm:flex">
          {others.map((o) => (
            <button
              key={o.tag}
              onClick={() => setI(o.idx)}
              className="text-[14px] uppercase tracking-[0.25em] text-[#bcbcbc] transition hover:text-brand"
            >
              {o.tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Enquiry + stats ───────────────────────── */

const TRUST = [
  { icon: Star, big: "4.8", small: "Google Rating", fill: true },
  { icon: Users, big: "1,000+", small: "Happy Clients" },
  { icon: MapPin, big: "Pan-India", small: "Service" },
  { icon: ShieldCheck, big: "100%", small: "Online Process" },
];

function EnquiryAndStats() {
  return (
    <section id="enquiry" className="relative scroll-mt-28 bg-panel2">
      <div className="container-x relative z-10 -mt-[55px]">
        <div className="border border-line bg-panel px-5 pb-8 pt-6 sm:px-7 sm:pt-7">
          <p className="mb-4 text-[16px] font-bold text-soft">
            Get a free call from our expert <span className="font-normal text-muted">— tell us what you need</span>
          </p>
          <LeadForm cta="Get Free Call" hint={false} />
        </div>
      </div>
      <div className="container-x grid grid-cols-2 gap-y-8 py-12 md:grid-cols-4">
        {TRUST.map((t) => (
          <div key={t.small} className="flex items-center justify-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center bg-icon text-brand">
              <t.icon className={`h-5 w-5 ${t.fill ? "fill-current" : ""}`} />
            </span>
            <div>
              <p className="font-serif text-[24px] font-bold leading-tight text-cream">{t.big}</p>
              <p className="text-[14px] text-soft">{t.small}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Shared bits ───────────────────────── */

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-[50px]">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-[32px] font-bold leading-[1.2] sm:text-[40px]">{title}</h2>
      {text && <p className="mt-3 text-[17px] text-muted">{text}</p>}
    </div>
  );
}

/* ───────────────────────── Categories ───────────────────────── */

function CategoryCard({ c, wide }: { c: (typeof CATEGORIES)[number]; wide: boolean }) {
  return (
    <Link
      to={`/services/${c.slug}`}
      className={`group flex flex-col border border-line bg-panel transition hover:border-brand/60 ${wide ? "sm:col-span-2" : ""}`}
    >
      <div className={`overflow-hidden ${wide ? "aspect-[2/1]" : "aspect-[4/3]"}`}>
        <img
          src={c.image}
          alt=""
          loading="lazy"
          className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${c.slug === "microsoft-certifications" ? "object-[50%_30%]" : ""}`}
        />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-6">
        <span className="block h-0.5 w-10 bg-brand" />
        <h3 className="mt-3.5 text-[22px] font-bold leading-[1.25]">{c.title}</h3>
        <p className="mt-2 text-[15px] leading-[1.53] text-muted">{c.short}</p>
        <span className="mt-3.5 inline-flex items-center gap-1.5 text-[15px] font-bold text-brand transition group-hover:gap-2.5">
          Explore <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function Categories() {
  const site = useSite();
  return (
    <section className="bg-navy py-20 sm:py-[84px]">
      <div className="container-x">
        <SectionHead eyebrow="Our Services" title="What Do You Need Help With?" text="Pick a category. Each one has a clear list of services." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} c={c} wide={c.slug === "registration" || c.slug === "microsoft-certifications"} />
          ))}
          <div className="gold-grad flex min-h-[280px] flex-col justify-center p-8 sm:col-span-2">
            <h3 className="text-[30px] font-bold leading-tight !text-[#1a1813]">Not sure where to start?</h3>
            <p className="mt-3 text-[16px] text-[#2a2418]">Our expert will suggest the right service — the first call is free.</p>
            <a
              href={telHref(site.phone)}
              className="mt-7 inline-flex w-fit items-center gap-2.5 bg-white px-5 py-3 text-[16px] font-bold text-[#1a1813] transition hover:bg-[#fffaf0]"
            >
              <Phone className="h-4 w-4" /> {site.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Popular (table) ───────────────────────── */

function Popular() {
  return (
    <section className="bg-panel2 py-20 sm:py-[84px]">
      <div className="container-x">
        <SectionHead eyebrow="Most Asked" title="Most Popular Services" text="These are what most of our customers start with." />
        <div className="hidden grid-cols-[49%_22%_1fr_auto] border-b-2 border-line pb-3 text-[13px] font-bold uppercase tracking-[0.08em] text-muted md:grid">
          <span>Service</span>
          <span>Category</span>
          <span>Time taken</span>
          <span className="text-right">Action</span>
        </div>
        {POPULAR.map((p) => {
          const cat = CATEGORIES.find((c) => c.slug === p.cat)!;
          const url = serviceUrl(p.cat, p.name);
          return (
            <div key={p.name} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-line py-4 md:grid-cols-[49%_22%_1fr_auto] md:gap-0">
              <Link to={url} className="font-serif text-[22px] font-bold text-cream hover:text-brand sm:text-[24px]">
                {p.name}
              </Link>
              <span className="order-3 text-[15px] text-muted md:order-none">{cat.title}</span>
              <span className="order-4 text-[15px] text-soft md:order-none">{p.days}</span>
              <Link
                to={`${url}#get-started`}
                className="row-span-3 inline-flex h-[41px] w-[88px] items-center justify-center justify-self-end border-2 border-brand text-[14px] font-bold text-brand transition hover:bg-brand hover:text-[#1a1813] md:row-span-1"
              >
                Enquire
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────── Process ───────────────────────── */

const STEPS = [
  { icon: ClipboardList, title: "Tell Us What You Need", text: "Fill the form or call us. It takes 1 minute." },
  { icon: Upload, title: "Share Your Documents", text: "Send them on WhatsApp or email. No office visit." },
  { icon: BadgeCheck, title: "We Get It Done", text: "You get updates at every step until it's complete." },
];

function Process() {
  return (
    <section className="bg-navy py-20 sm:py-[84px]">
      <div className="container-x">
        <SectionHead eyebrow="How It Works" title="Simple 3-Step Process" text="No office visits. No confusing forms." />
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <div key={s.title} className="relative overflow-hidden border border-line bg-panel p-8">
              <span className="pointer-events-none absolute -right-1 -top-6 select-none font-serif text-[150px] font-bold leading-none text-faded">
                {idx + 1}
              </span>
              <span className="gold-grad relative grid h-14 w-14 place-items-center text-[#1a1813]">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-7 text-[24px] font-bold">{s.title}</h3>
              <p className="relative mt-2.5 text-[16px] leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Why + reviews ───────────────────────── */

const WHY = [
  { icon: Sparkles, title: "One place for everything", text: "Registration, branding, website and marketing — no running around." },
  { icon: IndianRupee, title: "Clear pricing", text: "You know the full cost before we start. No hidden charges." },
  { icon: Smartphone, title: "Fully online", text: "Do everything from your phone, from anywhere in India." },
  { icon: Headphones, title: "Real experts", text: "CA, CS and design experts guide you at every step." },
];


function Stars({ size = "h-4 w-4", n = 5 }: { size?: string; n?: number }) {
  return (
    <span className="flex gap-0.5 text-[#fe9a00]">
      {Array.from({ length: n }, (_, k) => k).map((k) => (
        <Star key={k} className={`${size} fill-current`} />
      ))}
    </span>
  );
}

function WhyAndReviews() {
  const site = useSite();
  const content = useContent();
  const rs = content.reviewsSection;
  const REVIEWS = rs.show ? content.reviews.slice(0, 3) : [];
  return (
    <section className="bg-panel2 py-20 sm:py-[84px]">
      <div className="container-x grid gap-14 lg:grid-cols-[497fr_647fr]">
        <div>
          <p className="eyebrow">Why {site.siteName}</p>
          <h2 className="mt-3 text-[32px] font-bold leading-tight sm:text-[40px]">Why Businesses Trust Us</h2>
          <div className="mt-7">
            {WHY.map((w) => (
              <div key={w.title} className="flex gap-4 border-b border-line py-[26px] first:pt-3">
                <w.icon className="mt-1 h-6 w-6 shrink-0 text-brand" strokeWidth={1.6} />
                <div>
                  <h3 className="text-[21px] font-bold leading-snug">{w.title}</h3>
                  <p className="mt-1 text-[15px] leading-[1.6] text-muted">{w.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {REVIEWS.length > 0 && <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[24px] font-bold">What Our Clients Say</h3>
            {rs.rating && (
              <a href={rs.googleUrl || undefined} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[15px] text-soft">
                <Stars /> {rs.rating} on Google{rs.ratingCount ? ` (${rs.ratingCount})` : ""}
              </a>
            )}
          </div>
          <div className="mt-6 space-y-5">
            {REVIEWS.map((r) => (
              <figure key={r.id} className="border border-line bg-panel p-6">
                <Stars n={r.rating} />
                <blockquote className="mt-4 text-[16px] leading-relaxed text-soft">"{r.text}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="gold-grad grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold text-[#1a1813]">{r.name[0]}</span>
                  <span>
                    <span className="block text-[16px] font-bold text-soft">{r.name}</span>
                    <span className="text-[14px] text-muted">{r.place}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>}
      </div>
    </section>
  );
}

/* ───────────────────────── FAQ + CTA ───────────────────────── */


function Faq() {
  const FAQS = useContent().faqs;
  if (!FAQS.length) return null;
  return (
    <div className="container-x pt-20 sm:pt-[88px]">
      <div className="mb-10 text-center">
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-3 text-[32px] font-bold sm:text-[40px]">Common Questions</h2>
      </div>
      <div className="grid gap-x-14 md:grid-cols-2">
        {FAQS.map((f, idx) => (
          <div key={f.id} className="border-t border-line pb-[38px] pt-[30px]">
            <p className="font-serif text-[16px] font-bold text-brand">Q{idx + 1}.</p>
            <h3 className="mt-1.5 text-[21px] font-bold leading-snug sm:text-[22px]">{f.q}</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatestPosts() {
  const content = useContent();
  if (!content.blog.show || !content.posts.length) return null;
  return (
    <section className="bg-navy pt-20 sm:pt-[88px]">
      <div className="container-x">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{content.blog.title || "Blog"}</p>
            <h2 className="mt-3 text-[32px] font-bold sm:text-[40px]">Tips & Guides</h2>
          </div>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-[15px] font-bold text-brand hover:gap-2.5">
            See all articles <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.posts.slice(0, 3).map((p) => (
            <PostCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ tight = false }: { tight?: boolean }) {
  const site = useSite();
  return (
    <section className={`bg-navy pb-16 sm:pb-20 ${tight ? "pt-6 sm:pt-10" : "pt-16 sm:pt-20"}`}>
      <div className="container-x">
        <div className="bg-ink px-6 py-14 text-center sm:py-[70px]">
          <h2 className="text-[32px] font-bold !text-white sm:text-[46px]">Ready to Grow Your Business?</h2>
          <p className="mx-auto mt-4 max-w-lg text-[17px] text-muted">Talk to our expert today. The first consultation is free.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-brand">
              Get Free Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={waLink(site.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-wa px-6 py-3.5 text-[16px] font-bold text-white transition hover:brightness-95"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <>
      <Hero />
      <EnquiryAndStats />
      <Categories />
      <Popular />
      <Process />
      <WhyAndReviews />
      <LatestPosts />
      <section className="bg-navy">
        <Faq />
      </section>
      <CtaBand tight />
    </>
  );
}
