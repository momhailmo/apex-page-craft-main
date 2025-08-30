import { Linkedin, Instagram, Twitter, Facebook } from "lucide-react";

import { useSiteConfig } from "@/state/site-config";
import { bgStyleFrom } from "@/lib/background";

export default function SiteFooter() {
  const { state } = useSiteConfig();
  const socialOrder = state.footer.socialOrder || ["facebook","twitter","instagram","linkedin"];
  const socials = state.footer.socials || {};
  return (
    <footer className="mt-24 text-footer-foreground" style={bgStyleFrom(state.footer.background as any)}>
      <div className="mx-auto max-w-[1200px] px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {state.header.logoText}
          </h3>
          <p className="text-sm text-muted-foreground/80">
            We craft reliable web platforms and modern digital experiences with
            a focus on performance and usability.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:underline">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Services
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>hello@novatech.dev</li>
            <li>+1 (555) 010-2145</li>
            <li>123 Innovation Dr, San Francisco, CA</li>
          </ul>
          <div className="flex gap-3 mt-4">
            {socialOrder.map((k) => {
              const url = (socials as any)[k];
              if (!url) return null;
              return (
                <a key={k} aria-label={k} href={url} className="hover:opacity-90">
                  {k === "facebook" && <Facebook className="h-5 w-5 text-[#1877F2]" />}
                  {k === "twitter" && <Twitter className="h-5 w-5 text-[#1DA1F2]" />}
                  {k === "instagram" && <Instagram className="h-5 w-5 text-[#E1306C]" />}
                  {k === "linkedin" && <Linkedin className="h-5 w-5 text-[#0A66C2]" />}
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1200px] px-6 py-4 text-xs text-muted-foreground/70 flex items-center justify-between">
          <span>{state.footer.text}</span>
          <span>{state.footer.extraText || "Built with care."}</span>
        </div>
      </div>
    </footer>
  );
}
