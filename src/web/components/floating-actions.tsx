import { useEffect, useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { waLink } from "../lib/site";
import { fillTokens, telHref, useSite } from "../queries/site";
import { WaIcon } from "./header";
import { ChatPanel } from "./chat-panel";

export function FloatingActions() {
  const site = useSite();
  const [chat, setChat] = useState(false);
  const [hint, setHint] = useState(false);
  const bot = site.bot;
  const wa = waLink(site.whatsapp, fillTokens(bot.whatsappMessage, { business: site.siteName, name: "", phone: site.phone }));

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* WhatsApp — bottom left */}
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-20 left-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] transition hover:scale-105 md:bottom-6 md:left-6"
      >
        <WaIcon className="h-7 w-7" />
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-wa/40" />
      </a>

      {/* Chatbot — bottom right */}
      {bot.enabled && chat && <ChatPanel onClose={() => setChat(false)} />}
      {bot.enabled && hint && !chat && bot.hint && (
        <button
          onClick={() => setChat(true)}
          className="fixed bottom-[148px] right-4 z-40 hidden max-w-[220px] border border-line bg-panel px-4 py-2.5 text-left text-[14px] font-bold text-soft shadow-[0_14px_34px_-14px_rgba(0,0,0,0.9)] sm:block md:bottom-[92px] md:right-6"
        >
          {fillTokens(bot.hint, { business: site.siteName, name: "there", phone: site.phone })}
        </button>
      )}
      {bot.enabled && (
      <button
        onClick={() => {
          setChat((v) => !v);
          setHint(false);
        }}
        aria-label={chat ? "Close chat" : "Open chat assistant"}
        className="gold-grad fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full text-[#1a1813] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.9)] ring-1 ring-brand/40 transition hover:scale-105 md:bottom-6 md:right-6"
      >
        {chat ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      )}

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 md:hidden">
        <a href={telHref(site.phone)} className="gold-grad flex items-center justify-center gap-2 py-4 font-bold text-[#1a1813]">
          <Phone className="h-4 w-4" /> {bot.callLabel || "Call Now"}
        </a>
        <a href={wa} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-wa py-4 font-bold text-white">
          <WaIcon className="h-4 w-4" /> {bot.whatsappLabel || "WhatsApp"}
        </a>
      </div>
    </>
  );
}
