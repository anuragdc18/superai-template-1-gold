import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, MessageCircle, Phone, RotateCcw, Send, X } from "lucide-react";
import { waLink } from "../lib/site";
import { fillTokens, telHref, useSite } from "../queries/site";
import { useCreateLead } from "../queries/leads";
import { client } from "../lib/api";
import { WaIcon } from "./header";
import { respond, startChat, type Action, type BotLink, type Chip, type Customer, type Memory } from "../lib/bot/engine";

type Line = { id: number; role: "bot" | "user"; text: string; saved?: boolean; links?: BotLink[] };
type Saved = { lines: Line[]; chips: Chip[]; memory: Memory };

const CUSTOMER_KEY = "tm_chat_customer";
const CONVO_KEY = "tm_chat_convo_v2";

function loadCustomer(): Customer | null {
  try {
    const c = JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? "null");
    return c && typeof c.name === "string" && typeof c.phone === "string" ? c : null;
  } catch {
    return null;
  }
}
function saveCustomer(c: Customer | null) {
  try {
    if (c) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c));
    else localStorage.removeItem(CUSTOMER_KEY);
  } catch {
    /* storage blocked — the chat still works */
  }
}
function loadConvo(): Saved | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(CONVO_KEY) ?? "null");
    return s && Array.isArray(s.lines) && s.memory ? s : null;
  } catch {
    return null;
  }
}
function saveConvo(s: Saved | null) {
  try {
    if (s) sessionStorage.setItem(CONVO_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(CONVO_KEY);
  } catch {
    /* ignore */
  }
}

/** Tiny formatter: **bold**, "• " bullets, "1. " steps and line breaks. */
function RichText({ text }: { text: string }) {
  const bold = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-bold text-cream">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
  return (
    <>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <span key={i} className="block h-2" />;
        const bullet = line.match(/^\s*•\s+(.*)$/);
        const step = line.match(/^\s*(\d+)\.\s+(.*)$/);
        if (bullet)
          return (
            <span key={i} className="flex gap-2 pl-0.5">
              <span className="mt-[10px] h-px w-2.5 shrink-0 bg-brand" />
              <span>{bold(bullet[1])}</span>
            </span>
          );
        if (step)
          return (
            <span key={i} className="flex gap-2">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-icon font-serif text-[11px] font-bold text-brand">{step[1]}</span>
              <span>{bold(step[2])}</span>
            </span>
          );
        return (
          <span key={i} className="block">
            {bold(line)}
          </span>
        );
      })}
    </>
  );
}

function Bubble({ line }: { line: Line }) {
  if (line.saved)
    return (
      <div className="flex items-start gap-2 self-start border border-brand/40 bg-icon px-3 py-2 text-[13px] font-bold text-brand">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <RichText text={line.text} />
        </span>
      </div>
    );
  const me = line.role === "user";
  return (
    <div className={`flex max-w-[88%] flex-col gap-1.5 ${me ? "self-end items-end" : "self-start"}`}>
      <div
        className={`px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
          me ? "gold-grad font-bold text-[#1a1813]" : "border border-line bg-panel text-soft"
        }`}
      >
        {me ? line.text : <RichText text={line.text} />}
      </div>
      {line.links?.map((l) =>
        l.href.startsWith("/") ? (
          <Link
            key={l.href + l.label}
            href={l.href}
            className="inline-flex items-center gap-1 border border-brand/50 px-2.5 py-1.5 text-[12.5px] font-bold text-brand hover:bg-brand hover:text-[#1a1813]"
          >
            {l.label.replace(/\s*→$/, "")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <a
            key={l.href + l.label}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 border border-brand/50 px-2.5 py-1.5 text-[12.5px] font-bold text-brand hover:bg-brand hover:text-[#1a1813]"
          >
            {l.label.replace(/\s*→$/, "")} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        ),
      )}
    </div>
  );
}

function Typing() {
  return (
    <div className="flex w-16 items-center justify-center gap-1 self-start border border-line bg-panel px-3 py-3">
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${d}ms` }} />
      ))}
    </div>
  );
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const site = useSite();
  const bot = site.bot;
  const createLead = useCreateLead();
  const [customer, setCustomer] = useState<Customer | null>(() => (bot.collectDetails ? loadCustomer() : null));
  const [lines, setLines] = useState<Line[]>([]);
  const [chips, setChips] = useState<Chip[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const memory = useRef<Memory | null>(null);
  const customerRef = useRef<Customer | null>(customer);
  const idRef = useRef(0);
  const timers = useRef<number[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tokens = { business: site.siteName, phone: site.phone, name: (customer?.name ?? "").split(" ")[0] || "there" };
  const t = (s: string) => fillTokens(s, tokens);

  const runActions = (actions: Action[]) => {
    for (const a of actions) {
      if (a.type === "setCustomer") {
        customerRef.current = a.customer;
        setCustomer(a.customer);
        if (bot.collectDetails || a.customer.phone) saveCustomer(a.customer);
      } else if (a.type === "saveLead") {
        createLead.mutate({ ...a.lead, email: a.lead.email ?? "", source: "chatbot" });
      } else if (a.type === "miss") {
        client.bot.logMiss({ question: a.question }).catch(() => {});
      }
    }
  };

  /** Show bot messages one by one with a short, natural typing pause. */
  const deliver = (msgs: { text: string; saved?: boolean; links?: BotLink[] }[], nextChips: Chip[]) => {
    setChips([]);
    setTyping(true);
    let delay = 0;
    msgs.forEach((m, i) => {
      delay += Math.min(350 + m.text.length * 4, 1100);
      timers.current.push(
        window.setTimeout(() => {
          setLines((l) => [...l, { id: ++idRef.current, role: "bot", ...m }]);
          if (i === msgs.length - 1) {
            setTyping(false);
            setChips(nextChips);
          }
        }, delay),
      );
    });
    if (!msgs.length) setTyping(false);
  };

  // restore the conversation (same browser tab) or start a new one
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; // run once, even under React StrictMode
    started.current = true;
    const saved = loadConvo();
    if (saved && saved.lines.length) {
      memory.current = saved.memory;
      idRef.current = Math.max(0, ...saved.lines.map((l) => l.id));
      setLines(saved.lines);
      setChips(saved.chips);
    } else {
      const r = startChat(site, customerRef.current);
      memory.current = r.memory;
      const [first, ...rest] = r.messages;
      if (first) setLines([{ id: ++idRef.current, role: "bot", ...first }]);
      if (rest.length) deliver(rest, r.chips);
      else setChips(r.chips);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // remember the conversation while the visitor moves between pages
  useEffect(() => {
    if (memory.current && !typing) saveConvo({ lines: lines.slice(-60), chips, memory: memory.current });
  }, [lines, chips, typing]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, typing, chips]);

  const send = (text: string, shown?: string) => {
    const msg = text.trim();
    if (!msg || typing || !memory.current) return;
    setInput("");
    setLines((l) => [...l, { id: ++idRef.current, role: "user", text: (shown ?? msg).replace(/^[^\p{L}\p{N}]+\s*/u, "") || msg }]);
    const r = respond(msg, site, customerRef.current, memory.current);
    memory.current = r.memory;
    runActions(r.actions);
    deliver(r.messages, r.chips);
  };

  const onChip = (c: Chip) => {
    if (c.kind === "call" || c.kind === "whatsapp" || c.kind === "link") return;
    send(c.send ?? c.label, c.label);
  };

  const restart = (forget: boolean) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (forget) {
      saveCustomer(null);
      customerRef.current = null;
      setCustomer(null);
    }
    saveConvo(null);
    const r = startChat(site, customerRef.current);
    memory.current = r.memory;
    idRef.current = 0;
    setLines([]);
    deliver(r.messages, r.chips);
  };

  const step = memory.current?.step ?? "chat";
  const pending = memory.current?.pending;
  const wantsPhone = step === "phone" || pending === "cbPhone";
  const placeholder =
    step === "name" || pending === "cbName"
      ? "Your name"
      : wantsPhone
        ? "10-digit mobile number"
        : step === "email"
          ? "Email ID or type skip"
          : t(bot.placeholder);

  const chipClass = "border px-3 py-1.5 text-[13px] font-bold transition";

  return (
    <div className="fixed inset-x-3 bottom-20 z-[70] flex max-h-[min(640px,calc(100vh-110px))] flex-col overflow-hidden border border-line bg-navy shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] sm:inset-x-auto sm:right-6 sm:w-[390px] md:bottom-24">
      <div className="flex items-center gap-3 border-b border-line bg-ink px-4 py-3.5 text-soft">
        <span className="gold-grad relative grid h-10 w-10 place-items-center text-[#1a1813]">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-wa ring-2 ring-ink" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate font-serif text-[17px] font-bold text-cream">{t(bot.name)}</p>
          <p className="truncate text-[12px] text-muted">
            {customer?.name ? (
              <>
                Hi {customer.name.split(" ")[0]} ·{" "}
                <button onClick={() => restart(true)} className="underline decoration-muted/50 hover:text-brand">
                  Not you?
                </button>
              </>
            ) : (
              t(bot.status)
            )}
          </p>
        </div>
        <button onClick={() => restart(false)} aria-label="Start a new chat" title="Start a new chat" className="p-1.5 text-muted hover:text-brand">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button onClick={onClose} aria-label="Close chat" className="p-1.5 text-muted hover:text-brand">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-navy px-4 py-4" aria-live="polite">
        {lines.map((l) => (
          <Bubble key={l.id} line={l} />
        ))}
        {typing && <Typing />}
        {!typing && chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {chips.map((c) =>
              c.kind === "call" ? (
                <a key={c.label} href={telHref(site.phone)} className={`${chipClass} border-line bg-panel text-soft hover:border-brand hover:text-brand`}>
                  {c.label}
                </a>
              ) : c.kind === "whatsapp" ? (
                <a
                  key={c.label}
                  href={waLink(site.whatsapp, t(bot.whatsappMessage))}
                  target="_blank"
                  rel="noreferrer"
                  className={`${chipClass} border-wa/40 bg-panel text-wa hover:bg-wa hover:text-white`}
                >
                  {c.label}
                </a>
              ) : (
                <button key={c.label} onClick={() => onChip(c)} className={`${chipClass} border-brand/50 bg-transparent text-brand hover:bg-brand hover:text-[#1a1813]`}>
                  {c.label}
                </button>
              ),
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 border-t border-line bg-ink px-3 py-2 text-[12px]">
        <a href={telHref(site.phone)} className="flex items-center gap-1 border border-line px-3 py-1.5 font-bold text-soft hover:border-brand hover:text-brand">
          <Phone className="h-3.5 w-3.5" /> {bot.callLabel || "Call us"}
        </a>
        <a
          href={waLink(site.whatsapp, t(bot.whatsappMessage))}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 border border-wa/40 px-3 py-1.5 font-bold text-wa"
        >
          <WaIcon className="h-3.5 w-3.5" /> {bot.whatsappLabel || "WhatsApp"}
        </a>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          inputRef.current?.focus();
        }}
        className="flex items-center gap-2 border-t border-line bg-ink p-3"
      >
        <input
          ref={inputRef}
          aria-label="Type your message"
          className="field !h-11 flex-1"
          placeholder={placeholder}
          inputMode={wantsPhone ? "numeric" : step === "email" ? "email" : "text"}
          autoComplete={step === "name" ? "name" : wantsPhone ? "tel" : step === "email" ? "email" : "off"}
          maxLength={300}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={typing || !input.trim()}
          aria-label="Send"
          className="gold-grad grid h-11 w-11 shrink-0 place-items-center text-[#1a1813] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
