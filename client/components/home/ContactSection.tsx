import { useEffect, useRef, useState } from "react";
import { ContactFormData, ContactResponse } from "@shared/api";
import { User, Mail, Pencil, MessageSquare } from "lucide-react";
import { useSiteConfig } from "@/state/site-config";

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-300">
        {icon}
      </div>
      {children}
    </div>
  );
}

export default function ContactSection() {
  const { state } = useSiteConfig();
  const [form, setForm] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});
  const [status, setStatus] = useState<string>("");
  const recaptchaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const siteKey =
      (window as any).RECAPTCHA_SITE_KEY ||
      (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey || (window as any).grecaptcha) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const validate = (): boolean => {
    const e: Partial<Record<keyof ContactFormData, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 10)
      e.message = "Message must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getRecaptchaToken = async (): Promise<string | undefined> => {
    const siteKey =
      (window as any).RECAPTCHA_SITE_KEY ||
      (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
    const grecaptcha = (window as any).grecaptcha;
    if (siteKey && grecaptcha?.ready) {
      return new Promise((resolve) => {
        grecaptcha.ready(() => {
          grecaptcha
            .execute(siteKey, { action: "submit" })
            .then((token: string) => resolve(token));
        });
      });
    }
    return undefined;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("Sending...");
    const token = await getRecaptchaToken();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken: token }),
      });
      const data = (await res.json()) as ContactResponse;
      if (!res.ok) {
        setErrors(data.fieldErrors ?? {});
        setStatus(data.message);
        return;
      }
      setStatus(data.message);
      try {
        const arr = JSON.parse(localStorage.getItem("contactMessages") || "[]");
        arr.unshift({
          ...form,
          id: Date.now().toString(),
          read: false,
          at: new Date().toISOString(),
        });
        localStorage.setItem("contactMessages", JSON.stringify(arr));
        window.dispatchEvent(new CustomEvent("contact-messages-change"));
      } catch {}
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    }
  };

  const pad = state.settings?.sectionPadding?.contact ?? 32;
  const recipient = state.settings?.contactEmail || "configure in Settings";
  return (
    <section
      id="contact"
      className="mx-auto max-w-[1200px] px-6 mt-16"
      style={{
        paddingTop: pad,
        paddingBottom: pad,
        background: state.theme.contactSectionBg,
      }}
    >
      <div
        className="mx-auto max-w-[800px] rounded-2xl text-white p-8 shadow-2xl border border-white/10"
        style={{ background: state.theme.contactSectionBg || "#1a1a1a" }}
      >
        <h2 className="text-2xl font-bold mb-2">Let’s Talk</h2>
        <p className="text-xs text-neutral-300 mb-4">
          Messages will be sent to: {recipient}
        </p>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field icon={<User className="h-4 w-4" />}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </Field>
            <Field icon={<Mail className="h-4 w-4" />}>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                type="email"
                className="w-full h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </Field>
          </div>
          <div>
            <Field icon={<Pencil className="h-4 w-4" />}>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Subject"
                className="w-full h-12 rounded-xl bg-[#2a2a2a] pl-10 pr-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </Field>
          </div>
          <div>
            <Field icon={<MessageSquare className="h-4 w-4" />}>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Message"
                className="w-full min-h-[140px] rounded-xl bg-[#2a2a2a] pl-10 pr-3 py-3 border border-[#444] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </Field>
          </div>
          {/* Errors */}
          <div className="text-red-400 text-sm space-y-1">
            {errors.name && <div>👤 {errors.name}</div>}
            {errors.email && <div>✉️ {errors.email}</div>}
            {errors.subject && <div>📝 {errors.subject}</div>}
            {errors.message && <div>💬 {errors.message}</div>}
            {errors.recaptchaToken && <div>⚠️ {errors.recaptchaToken}</div>}
          </div>
          <div ref={recaptchaRef} />
          <div>
            <button
              type="submit"
              className="h-12 w-48 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg hover:shadow-xl transition"
            >
              Send Your Message
            </button>
          </div>
          {status && <div className="text-sm text-neutral-300">{status}</div>}
        </form>
      </div>
    </section>
  );
}
