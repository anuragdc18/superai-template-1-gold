import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { CATEGORIES, serviceUrl } from "../lib/site";
import { telHref, useSite } from "../queries/site";
import { Logo } from "./header";

export function Footer() {
  const site = useSite();
  const reg = CATEGORIES[0];
  const brandDesign = [CATEGORIES[1], CATEGORIES[2]];
  const digital = [CATEGORIES[3], CATEGORIES[4], CATEGORIES[5], CATEGORIES[6]];
  const link = "text-[15px] text-muted transition hover:text-brand";
  return (
    <footer className="bg-ink text-muted">
      <div className="container-x grid gap-10 pb-[52px] pt-16 md:grid-cols-2 lg:grid-cols-[366px_292px_291px_1fr] lg:gap-0">
        <div>
          <Logo />
          <p className="mt-5 max-w-[320px] text-[15px] leading-relaxed">{site.tagline}</p>
          <div className="mt-5 space-y-[6px] text-[15px]">
            <a href={telHref(site.phone)} className="flex items-center gap-2.5 hover:text-brand">
              <Phone className="h-4 w-4" /> {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 hover:text-brand">
              <Mail className="h-4 w-4" /> {site.email}
            </a>
            {site.addresses.length ? (
              site.addresses.map((a, i) => (
                <p key={i} className="flex items-start gap-2.5">
                  <MapPin className="mt-1 h-4 w-4 shrink-0" /> <span className="whitespace-pre-line">{a.line}</span>
                </p>
              ))
            ) : (
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4" /> {site.city}
              </p>
            )}
          </div>
          <div className="mt-5 flex gap-2">
            {(
              [
                ["facebook", Facebook],
                ["instagram", Instagram],
                ["linkedin", Linkedin],
                ["youtube", Youtube],
              ] as const
            )
              .filter(([k]) => site.socials[k])
              .map(([k, Icon]) => (
                <a
                  key={k}
                  href={site.socials[k]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={k}
                  className="grid h-9 w-9 place-items-center border border-line text-muted hover:border-brand hover:text-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-[18px] font-bold !text-white">Registration</h4>
          <ul className="space-y-2">
            {reg.menuItems.slice(0, 6).map((m) => (
              <li key={m}>
                <Link to={serviceUrl("registration", m)} className={link}>
                  {m}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-[18px] font-bold !text-white">Branding &amp; Design</h4>
          <ul className="space-y-2">
            {[...brandDesign[0].menuItems.slice(0, 3).map((m) => [brandDesign[0].slug, m]), ...brandDesign[1].menuItems.slice(0, 3).map((m) => [brandDesign[1].slug, m])].map(([slug, m]) => (
              <li key={slug + m}>
                <Link to={serviceUrl(slug, m)} className={link}>
                  {m.replace("Flyer & Poster", "Flyer & Poster")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-[18px] font-bold !text-white">Digital</h4>
          <ul className="space-y-2">
            {digital.map((c) => (
              <li key={c.slug}>
                <Link to={`/services/${c.slug}`} className={link}>
                  {c.slug === "website" ? "Website Development" : c.slug === "ai-tools" ? "AI & Automation" : c.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/contact" className={link}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#26231e]">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-[14px] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.siteName}. All rights reserved.
          </p>
          <p>Serving businesses across India</p>
        </div>
      </div>
    </footer>
  );
}
