import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowRight, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { CATEGORIES, serviceUrl, slugify } from "../lib/site";
import { LeadForm } from "../components/lead-form";
import { CtaBand } from "./index";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const cat = CATEGORIES.find((c) => c.slug === slug);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
        el.classList.add("ring-2", "ring-brand");
        setTimeout(() => el.classList.remove("ring-2", "ring-brand"), 2200);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [slug]);

  if (!cat) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <Link to="/" className="btn-brand mt-6">Go Home</Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy">
        <img src={cat.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/85 to-navy/35" />
        <div className="container-x py-16 sm:py-24">
          <nav className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.2em] text-brand">
            <Link to="/" className="hover:text-soft">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-soft">{cat.title}</span>
          </nav>
          <h1 className="rise mt-4 max-w-3xl text-[40px] font-bold leading-[1.1] !text-white sm:text-[56px]">{cat.title}</h1>
          <p className="rise mt-4 max-w-xl text-[17px] leading-relaxed text-white/85" style={{ animationDelay: "100ms" }}>{cat.intro}</p>
          <a href="#enquire" className="btn-brand rise mt-7" style={{ animationDelay: "180ms" }}>
            Get Free Consultation <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <div className="border-b border-line bg-panel">
        <div className="container-x flex gap-2 overflow-x-auto py-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={`/services/${c.slug}`}
              className={`whitespace-nowrap px-4 py-2 text-[14px] font-medium transition ${
                c.slug === cat.slug ? "gold-grad font-bold text-[#1a1813]" : "border border-line text-soft hover:border-brand hover:text-brand"
              }`}
            >
              {c.title}
            </Link>
          ))}
        </div>
      </div>

      <section className="py-14">
        <div className="container-x grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{cat.slug === "microsoft-certifications" ? "All Microsoft Certifications" : `All ${cat.title} Services`}</h2>
            <p className="mt-2">{cat.slug === "microsoft-certifications" ? 'Tap "Learn More" to see who it is for and what you get.' : 'Tap "Learn More" to see details, documents and time taken.'}</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {cat.services.map((s) => (
                <div
                  key={s.name}
                  id={slugify(s.name)}
                  className="scroll-mt-32 flex flex-col border border-line bg-panel p-5 transition hover:border-brand/60"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <div>
                      <h3 className="font-bold leading-snug">{s.name}</h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4 pl-8">
                    <Link
                      to={serviceUrl(cat.slug, s.name)}
                      className="inline-flex items-center gap-1 text-[14px] font-bold text-brand hover:gap-2"
                    >
                      Learn More <ArrowRight className="h-4 w-4" />
                    </Link>
                    {s.days ? (
                      <span className="flex items-center gap-1.5 text-[13px] text-muted"><Clock className="h-3.5 w-3.5" /> {s.days}</span>
                    ) : <span />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside id="enquire" className="scroll-mt-28 border border-line bg-panel p-6  lg:sticky lg:top-28">
            <h3 className="text-xl font-bold">Get a Free Call</h3>
            <p className="mt-1 text-[14px]">Our expert will call you and explain everything.</p>
            <div className="mt-5">
              <LeadForm layout="stack" source={`category:${cat.slug}`} defaultService={cat.services[0].name} />
            </div>
          </aside>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
