import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { LifeBuoy, BookOpen, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_app/support")({
  head: () => ({ meta: [{ title: "Support — Gateway" }] }),
  component: SupportPage,
});

const FAQS = [
  { q: "How do I create an order?", a: "Go to the Orders page, click 'Create order', fill in the customer details, add line items by selecting products and quantities, then submit. The order will appear in the list immediately." },
  { q: "How do I add a product?", a: "Navigate to Products and click 'Add product'. Enter a unique SKU, product name, unit price, and optionally a category and reorder point. Products are available immediately for order creation." },
  { q: "How do I track inventory?", a: "The Inventory page shows stock levels across all warehouses. Use the warehouse filter to focus on a specific location. Click any row to see full product details." },
  { q: "What does mock mode include?", a: "Mock mode pre-loads sample orders, products, and inventory data. It runs entirely in the browser with localStorage persistence — no backend needed. Set VITE_API_BASE_URL=mock to enable it." },
  { q: "How do I connect a live backend?", a: "Set the VITE_API_BASE_URL environment variable to your FastAPI instance URL (e.g. https://api.example.com). The frontend will proxy all API calls to that endpoint." },
  { q: "What roles and permissions are available?", a: "The system supports admin, operator, and viewer roles. Admins can create and edit everything. Operators can manage orders and inventory. Viewers have read-only access." },
];

const SUBJECTS = ["Bug report", "Feature request", "Account", "Other"] as const;

function SupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setName(user?.full_name ?? "");
    setEmail(user?.email ?? "");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-10">

      {/* Hero */}
      <section>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          <LifeBuoy className="h-3 w-3" />
          <span>Support</span>
        </div>
        <h1 className="mt-2 text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] leading-tight">
          How can we help?
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
          Browse the FAQ below, search the docs, or send us a message.
        </p>
      </section>

      {/* Docs link */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Check the documentation</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Most questions are answered in our docs — guides, API reference, and troubleshooting.
            </p>
            <Link
              to="/docs"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
            >
              Browse docs <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Frequently asked questions</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Contact form */}
      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Send us a message</h2>
          </div>
        </header>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select a subject…</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-[var(--color-success)]" />
              Usually replies within 24 hours
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send message"}
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
